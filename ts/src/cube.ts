// ---------------------------------------------------------------------------

import Exchange from './abstract/cube.js';
import {
    AuthenticationError,
    BadRequest,
    BadSymbol,
    InsufficientFunds,
    InvalidOrder,
    OrderNotFound,
} from './base/errors.js';
import { DECIMAL_PLACES } from './base/functions/number.js';
import {
    Balances,
    Currencies,
    Currency,
    IndexType,
    Int,
    Market,
    Num,
    OHLCV,
    Order,
    OrderBook,
    OrderSide,
    OrderType,
    Str,
    Strings,
    Ticker,
    Tickers,
    Trade,
    TradingFeeInterface,
    Transaction,
} from './base/types.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
// ---------------------------------------------------------------------------

/**
 * @class cube
 * @augments Exchange
 */
export default class cube extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cube',
            'name': 'cube',
            'countries': [],
            'urls': {
                'referral': '',
                'logo': 'https://www.cube.exchange/assets/cube-logo-180x180.png',
                'api': {
                    'rest': {
                        'production': {
                            'iridium': 'https://api.cube.exchange/ir/v0',
                            'mendelev': 'https://api.cube.exchange/md/v0',
                            'osmium': 'https://api.cube.exchange/os/v0',
                        },
                        'staging': {
                            'iridium': 'https://staging.cube.exchange/ir/v0',
                            'mendelev': 'https://staging.cube.exchange/md/v0',
                            'osmium': 'https://staging.cube.exchange/os/v0',
                        },
                    },
                    'ws': {
                        'production': {
                            'iridium': 'wss://api.cube.exchange/ir',
                            'mendelev': 'wss://api.cube.exchange/md',
                            'osmium': 'wss://api.cube.exchange/os',
                        },
                        'staging': {
                            'iridium': 'wss://staging.cube.exchange/ir',
                            'mendelev': 'wss://staging.cube.exchange/md',
                            'osmium': 'wss://staging.cube.exchange/os',
                        },
                    },
                },
                'www': 'https://www.cube.exchange/',
                'doc': 'https://cubexch.gitbook.io/cube-api',
                'fees': 'https://www.cube.exchange/fees',
            },
            'version': 'v0',
            'api': {
                'rest': {
                    'iridium': {
                        'public': {
                            'get': {
                                '/markets': 1,
                                '/history/klines': 1,
                                '/points/loyalty-leaderboard': 1,
                                '/points/referral-leaderboard': 1,
                                '/points/blocks-leaderboard': 1,
                            },
                        },
                        'private': {
                            'get': {
                                '/users/check': 1,
                                '/users/info': 1,
                                '/users/subaccounts': 1,
                                '/users/subaccount/{subaccountId}': 1,
                                '/users/subaccount/{subaccountId}/positions': 1,
                                '/users/subaccount/{subaccountId}/transfers': 1,
                                '/users/subaccount/{subaccountId}/deposits': 1,
                                '/users/subaccount/{subaccountId}/withdrawals': 1,
                                '/users/subaccount/{subaccountId}/orders': 1,
                                '/users/subaccount/{subaccountId}/fills': 1,
                                '/users/fee-estimate/{market_id}': 1,
                                '/users/address': 1,
                                '/users/address/settings': 1,
                                '/users/loot-boxes': 1,
                                '/users/invites': 1,
                                '/users/daily-loyalty': 1,
                                '/users/user-tier': 1,
                            },
                            'post': {
                                '/users/withdraw': 1,
                                '/users/subaccounts': 1,
                            },
                            'patch': {
                                '/users/subaccount/{subaccountId}': 1,
                            },
                        },
                    },
                    'mendelev': {
                        'public': {
                            'get': {
                                '/book/{market_id}/snapshot': 1,
                                '/parsed/book/{market_symbol}/snapshot': 1,
                                '/book/{market_id}/recent-trades': 1,
                                '/parsed/book/{market_symbol}/recent-trades': 1,
                                '/tickers/snapshot': 1,
                                '/parsed/tickers': 1,
                            },
                        },
                    },
                    'osmium': {
                        'private': {
                            'get': {
                                '/orders': 1,
                                '/positions': 1,
                            },
                            'delete': {
                                '/orders': 1,
                                '/order': 1,
                            },
                            'post': {
                                '/order': 1,
                            },
                            'patch': {
                                '/order': 1,
                            },
                        },
                    },
                },
            },
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createMarketOrder': false,
                'createOrder': true,
                'createOrders': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': 'emulated',
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': 'emulated',
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPermissions': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1s': '1s',
                '1m': '1m',
                '15m': '15m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
                '0': '1s',
                '1': '1m',
                '2': '15m',
                '3': '1h',
                '4': '4h',
                '5': '1d',
                'S1': '1s',
                'M1': '1m',
                'M15': '15m',
                'H1': '1h',
                'H4': '4h',
                'D1': '1d',
            },
            'timeout': 10000,
            'rateLimit': 100,
            'userAgent': false,
            'verbose': false,
            'markets': undefined,
            'symbols': undefined,
            'currencies': undefined,
            'markets_by_id': undefined,
            'currencies_by_id': undefined,
            'apiKey': undefined,
            'secret': undefined,
            'password': undefined,
            'uid': '',
            'options': {
                'environment': 'production',
                'subaccountId': undefined,
                'networks': {
                    'BTC': '1',
                    'ERC20': '2',
                    'SPL': '3',
                    'DOGE': '4',
                    'TAO': '5',
                    'LTC': '6',
                    'tBTC': '7',
                    'tETH': '8',
                },
                'impliedNetworks': {
                    'ETH': { 'ERC20': '2' },
                    'SOL': { 'SPL': '3' },
                },
                'legalMoney': {
                    'USD': true,
                },
                'mappings': {
                    'rawMarketsIdsToMarkets': {},
                    'rawCurrenciesIdsToCurrencies': {},
                },
            },
            'pro': true,
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.0004'),
                    'taker': this.parseNumber ('0.0008'),
                },
            },
            'commonCurrencies': undefined,
            'precisionMode': DECIMAL_PLACES,
            'exceptions': {
                'exact': {
                    'Must be authorized': AuthenticationError,
                    'Market not found': BadRequest,
                    'Insufficient funds': InsufficientFunds,
                    'Order not found': BadRequest,
                },
            },
        });
    }

    removeNonBase16Chars (input: string): string {
        const base16Chars = '0123456789abcdefABCDEF';
        let result = '';
        for (let i = 0; i < this.countItems (input); i++) {
            if (base16Chars.indexOf (input[i]) !== -1) {
                result += input[i];
            }
        }
        return result;
    }

    generateSignature () {
        const timestamp = this.seconds ();
        const timestampBytes = this.numberToLE (timestamp, 8);
        const secretKeyBytes = this.base16ToBinary (this.removeNonBase16Chars (this.secret));
        const message = this.binaryConcat (this.encode ('cube.xyz'), timestampBytes);
        const signature = this.hmac (message, secretKeyBytes, sha256, 'base64');
        return [ signature, timestamp ];
    }

    generateAuthenticationHeaders () {
        const [ signature, timestamp ] = this.generateSignature ();
        return {
            'x-api-key': this.apiKey,
            'x-api-signature': signature,
            'x-api-timestamp': timestamp.toString (),
        };
    }

    authenticateRequest (request) {
        const headers = this.safeDict (request, 'headers', {});
        request['headers'] = this.extend (headers, this.generateAuthenticationHeaders ());
        return request;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const environment = this.options['environment'];
        let endpoint = undefined;
        let apiArray = undefined;
        if (typeof api === 'string') {
            apiArray = api.split (',');
        } else {
            apiArray = api;
        }
        for (let i = 0; i < apiArray.length; i++) {
            if (api[i] === 'iridium') {
                endpoint = 'iridium';
                break;
            } else if (api[i] === 'mendelev') {
                endpoint = 'mendelev';
                break;
            } else if (api[i] === 'osmium') {
                endpoint = 'osmium';
                break;
            }
        }
        const baseUrl = this.urls['api']['rest'][environment][endpoint];
        let url = baseUrl + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        const methods = [ 'GET', 'HEAD' ];
        let found = false;
        for (let i = 0; i < methods.length; i++) {
            if (methods[i] === method) {
                if (this.countItems (params) > 0) {
                    url += '?' + this.urlencode (params);
                }
                found = true;
                break;
            }
        }
        if (!found) {
            body = JSON.stringify (params);
        }
        found = false;
        for (let i = 0; i < apiArray.length; i++) {
            if (apiArray[i] === 'private') {
                found = true;
                break;
            }
        }
        if (found) {
            let request = {
                'headers': {
                    'Content-Type': 'application/json',
                    'Referer': 'CCXT',
                },
            };
            request = this.authenticateRequest (request);
            headers = request['headers'];
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    setSandboxMode (enable) {
        if (enable === true) {
            this.options['environment'] = 'staging';
        } else {
            this.options['environment'] = 'production';
        }
    }

    async fetchMarketMeta (symbolOrSymbols = undefined) {
        let symbol = undefined;
        let marketId = undefined;
        let market = undefined;
        let symbols = undefined;
        let marketIds = undefined;
        let markets = undefined;
        await this.loadMarkets ();
        if (symbolOrSymbols !== undefined) {
            if (typeof symbolOrSymbols === 'string') {
                marketId = symbolOrSymbols.toUpperCase ().replace ('/', '');
                market = this.market (marketId);
                marketId = market['id'];
                symbolOrSymbols = this.safeSymbol (marketId, market);
                symbol = symbolOrSymbols;
                return {
                    'symbol': symbol,
                    'marketId': marketId,
                    'market': market,
                    'symbols': symbols,
                    'marketIds': marketIds,
                    'markets': markets,
                };
            } else if (Array.isArray (symbolOrSymbols)) {
                marketIds = [];
                markets = [];
                for (let i = 0; i < symbolOrSymbols.length; i++) {
                    marketId = symbolOrSymbols[i].toUpperCase ().replace ('/', '');
                    market = this.market (marketId);
                    marketId = market['id'];
                    symbolOrSymbols[i] = this.safeSymbol (marketId, market);
                    marketIds.push (marketId);
                    markets.push (market);
                }
                symbolOrSymbols = this.marketSymbols (symbolOrSymbols);
                symbols = symbolOrSymbols;
                return {
                    'symbol': symbol,
                    'marketId': marketId,
                    'market': market,
                    'symbols': symbols,
                    'marketIds': marketIds,
                    'markets': markets,
                };
            } else {
                throw new BadSymbol (this.id + ' symbolOrSymbols must be a string or an array of strings');
            }
        }
        return {
            'symbol': symbol,
            'marketId': marketId,
            'market': market,
            'symbols': symbols,
            'marketIds': marketIds,
            'markets': markets,
        };
    }

    injectSubAccountId (request, params) {
        if (this.safeInteger (params, 'subaccountId') !== undefined) {
            request['subaccountId'] = this.safeInteger (params, 'subaccountId');
        } else if (this.safeInteger (params, 'subAccountId') !== undefined) {
            request['subaccountId'] = this.safeInteger (params, 'subAccountId');
        } else if (this.safeInteger (this.options, 'subaccountId') !== undefined) {
            request['subaccountId'] = this.safeInteger (this.options, 'subaccountId');
        } else if (this.safeInteger (this.options, 'subAccountId') !== undefined) {
            request['subaccountId'] = this.safeInteger (this.options, 'subAccountId');
        }
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name cube#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://cubexch.gitbook.io/cube-api/rest-iridium-api#markets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.restIridiumPublicGetMarkets (params);
        // {
        //     "result": {
        //         "assets": [
        //             {
        //                 "assetId": 1,
        //                 "symbol": "BTC",
        //                 "decimals": 8,
        //                 "displayDecimals": 5,
        //                 "settles": true,
        //                 "assetType": "Crypto",
        //                 "sourceId": 1,
        //                 "metadata": {
        //                     "dustAmount": 3000
        //                 },
        //                 "status": 1
        //             },
        //             ...
        //         ],
        //         ...
        //     }
        // }
        const assets = this.safeList (this.safeDict (response, 'result'), 'assets');
        return this.parseCurrencies (assets);
    }

    parseCurrencies (assets): Currencies {
        this.options['mappings']['rawCurrenciesIdsToCurrencies'] = {};
        const result = {};
        for (let i = 0; i < assets.length; i++) {
            const rawCurrency = assets[i];
            const id = this.safeString (rawCurrency, 'symbol').toLowerCase ();
            const code = id.toUpperCase ();
            const name = this.safeString (this.safeDict (rawCurrency, 'metadata'), 'currencyName');
            const networkId = this.safeString (rawCurrency, 'sourceId');
            const networks = {};
            networks[networkId] = {
                'id': networkId,
            };
            const currency = this.safeCurrencyStructure ({
                'info': rawCurrency,
                'id': id,
                'numericId': this.safeInteger (rawCurrency, 'assetId'),
                'code': code,
                'precision': this.safeInteger (rawCurrency, 'decimals'),
                'type': this.safeStringLower (rawCurrency, 'assetType'),
                'name': name,
                'active': this.safeInteger (rawCurrency, 'status') === 1,
                'deposit': true,
                'withdraw': true,
                'fee': undefined, // TODO Check if it is possible to fill a withdraw fee!!!
                'fees': {}, // TODO Check if it is possible to fill a withdraw fee!!!
                'networks': networks,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
            result[code] = currency;
            this.options['mappings']['rawCurrenciesIdsToCurrencies'][this.safeInteger (currency, 'numericId')] = currency;
        }
        return result;
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name cube#fetchMarkets
         * @description retrieves data on all markets for cube
         * @see https://cubexch.gitbook.io/cube-api/rest-iridium-api#markets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.restIridiumPublicGetMarkets (params);
        // {
        //     "result": {
        //         "assets": [
        //             {
        //                 "assetId": 1,
        //                 "symbol": "BTC",
        //                 "decimals": 8,
        //                 "displayDecimals": 5,
        //                 "settles": true,
        //                 "assetType": "Crypto",
        //                 "sourceId": 1,
        //                 "metadata": {
        //                     "dustAmount": 3000
        //                 },
        //                 "status": 1
        //             },
        //             ...
        //         ],
        //         "markets": [
        //             {
        //                 "marketId": 100004,
        //                 "symbol": "BTCUSDC",
        //                 "baseAssetId": 1,
        //                 "baseLotSize": "1000",
        //                 "quoteAssetId": 7,
        //                 "quoteLotSize": "1",
        //                 "priceDisplayDecimals": 2,
        //                 "protectionPriceLevels": 3000,
        //                 "priceBandBidPct": 25,
        //                 "priceBandAskPct": 400,
        //                 "priceTickSize": "0.1",
        //                 "quantityTickSize": "0.00001",
        //                 "status": 1,
        //                 "feeTableId": 2
        //             },
        //             ...
        //         ],
        //         "feeTables": [
        //             {
        //                 "feeTableId": 1,
        //                 "feeTiers": [
        //                     {
        //                         "priority": 0,
        //                         "makerFeeRatio": 0.0,
        //                         "takerFeeRatio": 0.0
        //                     }
        //                 ]
        //             },
        //             {
        //                 "feeTableId": 2,
        //                 "feeTiers": [
        //                     {
        //                         "priority": 0,
        //                         "makerFeeRatio": 0.0004,
        //                         "takerFeeRatio": 0.0008
        //                     }
        //                 ]
        //             }
        //         ]
        //     }
        // }
        const rawMarkets = this.safeList (this.safeDict (response, 'result'), 'markets');
        const rawAssets = this.safeList (this.safeDict (response, 'result'), 'assets');
        this.currencies = this.parseCurrencies (rawAssets);
        return this.parseMarkets (rawMarkets);
    }

    parseMarkets (markets): Market[] {
        this.options['mappings']['rawMarketsIdsToMarkets'] = {};
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            if (this.safeString (markets[i], 'status') !== '1') {
                continue;
            }
            const market = this.parseMarket (markets[i]);
            result.push (market);
            this.options['mappings']['rawMarketsIdsToMarkets'][this.safeInteger (this.safeDict (market, 'info'), 'marketId')] = market;
        }
        return result;
    }

    parseMarket (market): Market {
        const id = this.safeString (market, 'symbol').toUpperCase ();
        // TODO Expose this object globally for the exchange so the currencies can be retrieved in O(1) time
        const currenciesByNumericId = {};
        for (let i = 0; i < this.countItems (this.currencies); i++) {
            const currenciesKeysArray = Object.keys (this.currencies);
            const targetCurrency = this.safeValue (this.currencies, currenciesKeysArray[i]);
            const targetCurrencyNumericId = this.safeInteger (targetCurrency, 'numericId');
            currenciesByNumericId[targetCurrencyNumericId] = targetCurrency;
        }
        const baseAsset = currenciesByNumericId[this.safeInteger (market, 'baseAssetId')];
        const quoteAsset = currenciesByNumericId[this.safeInteger (market, 'quoteAssetId')];
        const baseSymbol = this.safeString (this.safeDict (baseAsset, 'info'), 'symbol');
        const quoteSymbol = this.safeString (this.safeDict (quoteAsset, 'info'), 'symbol');
        const marketSymbol = baseSymbol + quoteSymbol;
        return this.safeMarketStructure ({
            'id': id,
            'lowercaseId': id.toLowerCase (),
            'symbol': marketSymbol,
            'base': this.safeString (baseAsset, 'code'),
            'quote': this.safeString (quoteAsset, 'code'),
            'settle': undefined,
            'baseId': this.safeString (baseAsset, 'id'),
            'quoteId': this.safeString (quoteAsset, 'id'),
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': this.safeInteger (market, 'status') === 1,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'taker': this.safeNumber (this.safeDict (this.fees, 'trading'), 'taker'),
            'maker': this.safeNumber (this.safeDict (this.fees, 'trading'), 'maker'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.precisionFromString (this.safeString (market, 'quantityTickSize')),
                'price': this.precisionFromString (this.safeString (market, 'priceTickSize')),
                'cost': undefined,
                'base': undefined,
                'quote': undefined,
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

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name cube#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://cubexch.gitbook.io/cube-api/rest-mendelev-api#book-market_id-snapshot
         * @see https://cubexch.gitbook.io/cube-api/rest-mendelev-api#parsed-book-market_symbol-snapshot
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        const meta = await this.fetchMarketMeta (symbol);
        symbol = this.safeString (meta, 'symbol');
        const request = { 'market_symbol': symbol };
        const response = await this.restMendelevPublicGetParsedBookMarketSymbolSnapshot (this.extend (request, params));
        //
        // {
        //   "result":{
        //       "ticker_id":"BTCUSDC",
        //       "timestamp":1711544655331,
        //       "bids":[
        //           [
        //               70635.6,
        //               0.01
        //           ]
        //       ],
        //       "asks":[
        //           [
        //               70661.8,
        //               0.1421
        //           ]
        //       ]
        //   }
        // }
        //
        const rawBids = this.safeList (this.safeDict (response, 'result'), 'bids', []);
        const rawAsks = this.safeList (this.safeDict (response, 'result'), 'asks', []);
        const bids = [];
        for (let i = 0; i < this.countItems (rawBids); i++) {
            if (!(this.parseToNumeric (rawBids[i][0]) <= 0 || this.parseToNumeric (rawBids[i][1]) <= 0)) {
                bids.push (rawBids[i]);
            }
        }
        const asks = [];
        for (let i = 0; i < this.countItems (rawAsks); i++) {
            if (!(this.parseToNumeric (rawAsks[i][0]) <= 0 || this.parseToNumeric (rawAsks[i][1]) <= 0)) {
                asks.push (rawAsks[i]);
            }
        }
        const rawOrderbook = {
            'bids': bids,
            'asks': asks,
        };
        const timestamp = this.safeInteger (this.safeDict (response, 'result'), 'timestamp'); // Don't use this.safeTimestamp()
        return this.parseOrderBook (rawOrderbook, symbol, timestamp, 'bids', 'asks');
    }

    parseBidsAsks (bidasks, priceKey: IndexType = 0, amountKey: IndexType = 1, countOrIdKey: IndexType = 2) {
        return bidasks;
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name cube#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://cubexch.gitbook.io/cube-api/rest-mendelev-api#parsed-tickers
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const meta = await this.fetchMarketMeta (symbol);
        symbol = this.safeString (meta, 'symbol');
        const tickers = await this.fetchTickers ([ symbol ], params);
        const ticker = this.safeValue (tickers, symbol, undefined);
        if (ticker === undefined) {
            throw new BadSymbol (this.id + ' fetchTicker() symbol ' + symbol + ' not found');
        }
        return ticker;
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //
        //       {
        //         ticker_id: "JTOUSDC",
        //         base_currency: "JTO",
        //         quote_currency: "USDC",
        //         timestamp: 1713217334960,
        //         last_price: 2.6624,
        //         base_volume: 337.12,
        //         quote_volume: 961.614166,
        //         bid: 2.6627,
        //         ask: 2.6715,
        //         high: 3.0515,
        //         low: 2.6272,
        //         open: 2.8051,
        //       }
        //
        const timestamp = this.safeInteger (ticker, 'timestamp');
        return this.safeTicker ({
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': this.safeNumber (ticker, 'base_volume'),
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': this.safeNumber (ticker, 'quote_volume'),
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'open'),
            'close': undefined,
            'last': this.safeNumber (ticker, 'last_price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'base_volume'),
            'quoteVolume': this.safeNumber (ticker, 'quote_volume'),
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name cube#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://cubexch.gitbook.io/cube-api/rest-mendelev-api#parsed-tickers
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const meta = await this.fetchMarketMeta (symbols);
        symbols = this.safeList (meta, 'symbols');
        const response = await this.restMendelevPublicGetParsedTickers (params);
        //
        //  {
        //     result: [
        //       {
        //     ticker_id: "JTOUSDC",
        //     base_currency: "JTO",
        //     quote_currency: "USDC",
        //     timestamp: 1713216571697,
        //     last_price: 2.6731,
        //     base_volume: 333.66,
        //     quote_volume: 953.635304,
        //     bid: 2.6653,
        //     ask: 2.6761,
        //     high: 3.0515,
        //     low: 2.6272,
        //     open: 2.8231,
        //      },
        //    ],
        //  }
        //
        const rawTickers = this.safeList (response, 'result', []);
        const result = {};
        for (let i = 0; i < rawTickers.length; i++) {
            const rawTicker = rawTickers[i];
            const rawTickerId = this.safeString (rawTicker, 'ticker_id').toUpperCase ().replace ('/', '');
            if (symbols !== undefined) {
                for (let j = 0; j < symbols.length; j++) {
                    if (symbols[j].toUpperCase () === rawTickerId) {
                        break;
                    }
                }
            }
            let marketId = undefined;
            try {
                marketId = this.marketId (rawTickerId);
            } catch (_exception) {
                continue;
            }
            const market = this.market (marketId);
            const symbol = this.safeString (market, 'symbol');
            const ticker = this.parseTicker (rawTicker, market);
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name cube#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://cubexch.gitbook.io/cube-api/rest-mendelev-api#parsed-tickers
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const meta = await this.fetchMarketMeta (symbol);
        symbol = this.safeString (meta, 'symbol');
        const market = this.safeDict (meta, 'market');
        const marketNumericId = this.safeInteger (this.safeDict (market, 'info'), 'marketId');
        const selectedTimeframe = this.timeframes[timeframe];
        const request = {
            'interval': selectedTimeframe,
        };
        if (marketNumericId !== undefined) {
            request['marketId'] = marketNumericId;
        }
        if (since !== undefined) {
            request['start_time'] = since; // The unix nanosecond timestamp that this kline covers.
        }
        const response = await this.restIridiumPublicGetHistoryKlines (this.extend (request, params));
        const data = this.safeValue (response, 'result', []);
        //
        //  {
        //    "result": [
        //      [
        //        1715280300,
        //        14736,
        //        14736,
        //        14736,
        //        14736,
        //        "7299"
        //      ],
        //      [
        //        1715279400,
        //        14734,
        //        14768,
        //        14720,
        //        14720,
        //        "14242"
        //      ]
        //    ]
        //  }
        //
        return this.parseOHLCVs (data, market, selectedTimeframe.toString (), since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined) : OHLCV {
        // Cube KLine format
        // [
        //     1715278500,  // start_time           |   ohlcv[0]
        //     14695,       // Kline open price.    |   ohlcv[1]
        //     14695,       // Kline close price.   |   ohlcv[2]
        //     14695,       // Kline high price.    |   ohlcv[3]
        //     14695,       // Kline low price.     |   ohlcv[4]
        //     "5784"       // volume_hi            |   ohlcv[5]
        // ]
        //
        // CCXT KLine format
        // [
        //     1504541580000, // UTC timestamp in milliseconds, integer |   ohlcv[0]
        //     4235.4,        // (O)pen price, float                    |   ohlcv[1]
        //     4240.6,        // (H)ighest price, float                 |   ohlcv[3]
        //     4230.0,        // (L)owest price, float                  |   ohlcv[4]
        //     4230.7,        // (C)losing price, float                 |   ohlcv[2]
        //     37.72941911    // (V)olume, float                        |   ohlcv[5]
        // ],
        const normalizer = Math.pow (10, this.safeInteger (this.safeDict (market, 'precision'), 'price'));
        return [
            this.parseToNumeric (ohlcv[0]),
            this.parseToNumeric (ohlcv[1]) / normalizer,
            this.parseToNumeric (ohlcv[3]) / normalizer,
            this.parseToNumeric (ohlcv[4]) / normalizer,
            this.parseToNumeric (ohlcv[2]) / normalizer,
            this.parseToNumeric (ohlcv[5]),
        ];
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name cube#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://cubexch.gitbook.io/cube-api/rest-iridium-api#users-positions
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        await this.fetchMarketMeta ();
        const request = {};
        this.injectSubAccountId (request, params);
        const response = await this.restIridiumPrivateGetUsersSubaccountSubaccountIdPositions (this.extend (request, params));
        const subaccountId = this.safeString (this.options, 'subaccountId');
        const allOrders = await this.fetchRawOrders ();
        const result = this.safeList (this.safeDict (this.safeDict (response, 'result'), subaccountId), 'inner');
        return this.parseBalance ({ 'result': result, 'allOrders': allOrders });
    }

    parseBalance (response): Balances {
        const result = this.safeValue (response, 'result');
        const allOrders = this.safeValue (response, 'allOrders');
        const openOrders = [];
        const filledUnsettledOrders = [];
        const allMarketsByNumericId = {};
        for (let i = 0; i < this.countItems (this.markets_by_id); i++) {
            const marketArrayItem = Object.values (this.markets_by_id)[i];
            const market = marketArrayItem[0];
            const marketInfo = this.safeDict (market, 'info');
            const marketNumericId = this.safeString (marketInfo, 'marketId');
            allMarketsByNumericId[marketNumericId] = market;
        }
        const free = {};
        const used = {};
        const total = {};
        const currenciesByNumericId = {};
        for (let i = 0; i < this.countItems (this.currencies); i++) {
            const currenciesKeysArray = Object.keys (this.currencies);
            const targetCurrency = this.safeValue (this.currencies, currenciesKeysArray[i]);
            const targetCurrencyNumericId = this.safeInteger (targetCurrency, 'numericId');
            currenciesByNumericId[targetCurrencyNumericId] = targetCurrency;
        }
        for (let i = 0; i < this.countItems (result); i++) {
            const asset = result[i];
            const assetAmount = parseInt (this.safeString (asset, 'amount'));
            if (assetAmount > 0) {
                const assetNumericId = this.parseToInt (this.safeString (asset, 'assetId'));
                const currency = currenciesByNumericId[assetNumericId];
                const currencyPrecision = this.safeInteger (currency, 'precision');
                const assetSymbol = this.safeString (currency, 'code');
                total[assetSymbol] = assetAmount / Math.pow (10, currencyPrecision);
                used[assetSymbol] = 0; // To prevent the 'parser' from adding 'null' when there are no orders holding an asset.
                free[assetSymbol] = 0; // To prevent the 'parser' from adding 'null' when there are no orders holding an asset.
            }
        }
        for (let i = 0; i < this.countItems (allOrders); i++) {
            const order = allOrders[i];
            const orderStatus = this.safeString (order, 'status');
            if (orderStatus === 'open') {
                openOrders.push (order);
            }
            if (orderStatus === 'filled') {
                const isSettled = this.safeString (order, 'settled');
                if (!isSettled) {
                    filledUnsettledOrders.push (order);
                }
            }
        }
        for (let i = 0; i < this.countItems (openOrders); i++) {
            const order = openOrders[i];
            const orderMarketId = this.safeString (order, 'marketId');
            const orderMarket = this.safeDict (allMarketsByNumericId, orderMarketId);
            const orderSide = this.safeString (order, 'side');
            const orderBaseToken = this.safeString (orderMarket, 'base');
            const orderQuoteToken = this.safeString (orderMarket, 'quote');
            const orderAmount = this.safeInteger (order, 'qty');
            const orderPrice = this.safeInteger (order, 'price');
            let targetToken = '';
            let lotSize = 0;
            if (orderSide === 'Ask') {
                targetToken = orderBaseToken;
                lotSize = this.safeInteger (this.safeDict (orderMarket, 'info'), 'baseLotSize');
            } else if (orderSide === 'Bid') {
                targetToken = orderQuoteToken;
                lotSize = this.safeInteger (this.safeDict (orderMarket, 'info'), 'quoteLotSize');
            }
            const targetCurrency = this.currency (targetToken);
            const targetCurrencyPrecision = this.safeInteger (targetCurrency, 'precision');
            let orderLockedAmount = 0;
            if (orderSide === 'Ask') {
                orderLockedAmount = orderAmount * lotSize / Math.pow (10, targetCurrencyPrecision);
            } else if (orderSide === 'Bid') {
                orderLockedAmount = orderAmount * orderPrice * lotSize / Math.pow (10, targetCurrencyPrecision);
            }
            used[targetToken] += orderLockedAmount;
            free[targetToken] = total[targetToken] - used[targetToken];
        }
        for (let i = 0; i < this.countItems (total); i++) { // For when an asset does not have any values locked in orders.
            const targetToken = Object.keys (total)[i];
            if (this.safeValue (free, targetToken) === 0) {
                const targetTokenTotalAmount = this.safeValue (total, targetToken);
                free[targetToken] = targetTokenTotalAmount;
            }
        }
        const timestamp = this.milliseconds ();
        const balanceResult = {
            'info': {
                'balances': result,
                'openOrders': openOrders,
                'filledUnsettledOrders': filledUnsettledOrders,
            },
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'free': free,
            'used': used,
            'total': total,
        };
        for (let i = 0; i < this.countItems (total); i++) {
            const assetSymbol = Object.keys (total)[i];
            const assetBalances = {
                'free': this.safeNumber (free, assetSymbol),
                'used': this.safeNumber (used, assetSymbol),
                'total': this.safeNumber (total, assetSymbol),
            };
            balanceResult[assetSymbol] = assetBalances;
        }
        return this.safeBalance (balanceResult);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        const meta = await this.fetchMarketMeta (symbol);
        symbol = this.safeString (meta, 'symbol');
        const marketId = this.safeString (meta, 'marketId');
        const market = this.safeDict (meta, 'market');
        const rawMarketId = this.safeInteger (this.safeDict (market, 'info'), 'marketId');
        const quantityTickSize = this.safeNumber (this.safeDict (market, 'info'), 'quantityTickSize');
        let exchangeAmount = undefined;
        if (quantityTickSize && quantityTickSize !== 0) {
            exchangeAmount = this.parseToInt (amount / quantityTickSize);
        }
        let exchangeOrderType = undefined;
        if (type === 'limit') {
            exchangeOrderType = 0;
        } else if (type === 'market') {
            exchangeOrderType = 1;
        } else if (type === 'MARKET_WITH_PROTECTION') {
            exchangeOrderType = 2;
        } else {
            throw new InvalidOrder ('OrderType was not recognized: ' + type);
        }
        let exchangeOrderSide = undefined;
        if (side === 'buy') {
            exchangeOrderSide = 0;
        } else if (side === 'sell') {
            exchangeOrderSide = 1;
        } else {
            throw new InvalidOrder ('OrderSide was not recognized: ' + side);
        }
        const timestamp = this.milliseconds ();
        const clientOrderId = this.safeInteger (params, 'clientOrderId', timestamp);
        const request = {
            'clientOrderId': clientOrderId,
            'requestId': this.safeInteger (params, 'requestId', 1),
            'marketId': rawMarketId,
            'quantity': exchangeAmount,
            'side': exchangeOrderSide,
            'timeInForce': this.safeInteger (params, 'timeInForce', 1),
            'orderType': exchangeOrderType,
            'selfTradePrevention': this.safeInteger (params, 'selfTradePrevention', 0),
            'postOnly': this.safeInteger (params, 'postOnly', 0),
            'cancelOnDisconnect': this.safeBool (params, 'cancelOnDisconnect', false),
        };
        const priceTickSize = this.parseToNumeric (this.safeValue (this.safeDict (market, 'info'), 'priceTickSize'));
        if (price !== undefined) {
            let lamportPrice = undefined;
            if (priceTickSize && priceTickSize !== 0) {
                lamportPrice = this.parseToInt (price / priceTickSize);
            }
            request['price'] = lamportPrice;
        }
        this.injectSubAccountId (request, params);
        const response = await this.restOsmiumPrivatePostOrder (this.extend (request, params));
        this.validateCreateOrderResponse (response);
        const order = this.safeDict (this.safeDict (response, 'result'), 'Ack');
        const exchangeOrderId = this.safeString (order, 'exchangeOrderId');
        const fetchedOrder = await this.fetchRawOrder (exchangeOrderId, marketId);
        let orderStatus = 'open';
        if (!fetchedOrder) {
            orderStatus = order ? 'filled' : 'rejected';
        }
        return this.parseOrder ({
            'order': order,
            'fetchedOrder': fetchedOrder,
            'orderStatus': orderStatus,
            'transactionType': 'creation',
        }, market as Market);
    }

    validateCreateOrderResponse (response: object) {
        const result = this.safeDict (response, 'result');
        if ('Ack' in result) {
            return;
        }
        const rejection = this.safeDict (result, 'Rej');
        if (rejection !== undefined) {
            const rejectReason = this.safeString (rejection, 'reason');
            if (rejectReason !== undefined) {
                this.handleCreateOrderReject (rejectReason, rejection);
            }
        }
        throw new InvalidOrder ('Order response is invalid: No Ack or Rej found.');
    }

    handleCreateOrderReject (reason: string, order: object) {
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const errorMessage = 'Failed to create order ' + clientOrderId + '. ';
        if (reason === '0') {
            throw new InvalidOrder (errorMessage + 'Unclassified error occurred.');
        } else if (reason === '1') {
            throw new InvalidOrder (errorMessage + 'Invalid quantity: Quantity was zero.');
        } else if (reason === '2') {
            throw new InvalidOrder (errorMessage + 'Invalid market ID: The specified market ID does not exist.');
        } else if (reason === '3') {
            throw new InvalidOrder (errorMessage + 'Duplicate order ID: The specified client order ID was not unique among open orders for this subaccount.');
        } else if (reason === '4') {
            throw new InvalidOrder (errorMessage + 'Invalid side specified.');
        } else if (reason === '5') {
            throw new InvalidOrder (errorMessage + 'Invalid time in force specified.');
        } else if (reason === '6') {
            throw new InvalidOrder (errorMessage + 'Invalid order type specified.');
        } else if (reason === '7') {
            throw new InvalidOrder (errorMessage + 'Invalid post-only flag specified.');
        } else if (reason === '8') {
            throw new InvalidOrder (errorMessage + 'Invalid self-trade prevention specified.');
        } else if (reason === '9') {
            throw new InvalidOrder (errorMessage + 'Unknown trader: Internal error with subaccount positions.');
        } else if (reason === '10') {
            throw new InvalidOrder (errorMessage + 'Price should not be specified for market or market limit orders.');
        } else if (reason === '11') {
            throw new InvalidOrder (errorMessage + 'Post-only with market order is not allowed.');
        } else if (reason === '12') {
            throw new InvalidOrder (errorMessage + 'Post-only with invalid time in force.');
        } else if (reason === '13') {
            throw new InvalidOrder (errorMessage + 'Exceeded spot position limits.');
        } else if (reason === '14') {
            throw new InvalidOrder (errorMessage + 'No opposing resting orders to trade against.');
        } else if (reason === '15') {
            throw new InvalidOrder (errorMessage + 'Post-only order would have crossed and traded.');
        } else if (reason === '16') {
            throw new InvalidOrder (errorMessage + 'Fill or kill (FOK) order was not fully fillable.');
        } else if (reason === '17') {
            throw new InvalidOrder (errorMessage + 'Only order cancelations are accepted at this time.');
        } else if (reason === '18') {
            throw new InvalidOrder (errorMessage + 'Protection price would not trade for market-with-protection orders.');
        } else if (reason === '19') {
            throw new InvalidOrder (errorMessage + 'Market orders cannot be placed because there is no internal reference price.');
        } else if (reason === '20') {
            throw new InvalidOrder (errorMessage + 'Slippage too high: The order would trade beyond allowed protection levels.');
        } else if (reason === '21') {
            throw new InvalidOrder (errorMessage + 'Outside price band: Bid price is too low or ask price is too high.');
        } else {
            throw new InvalidOrder (errorMessage + 'Unknown reason code: ' + reason + '.');
        }
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        const meta = await this.fetchMarketMeta (symbol);
        symbol = this.safeString (meta, 'symbol');
        const marketId = this.safeString (meta, 'marketId');
        const market = this.safeDict (meta, 'market');
        const rawMarketId = this.safeInteger (this.safeDict (market, 'info'), 'marketId');
        let fetchedOrder = await this.fetchRawOrder (id, marketId);
        if (!fetchedOrder) {
            fetchedOrder = {};
        }
        const clientOrderId = this.safeInteger (fetchedOrder, 'clientOrderId');
        const request = {
            'clientOrderId': clientOrderId,
            'requestId': this.safeInteger (params, 'requestId', 1),
            'marketId': rawMarketId,
        };
        this.injectSubAccountId (request, params);
        const response = await this.restOsmiumPrivateDeleteOrder (this.extend (request, params));
        this.validateCancelOrderResponse (response, fetchedOrder);
        return this.parseOrder ({
            'cancellationResponse': response,
            'fetchedOrder': fetchedOrder,
            'transactionType': 'cancellation',
        }, market as Market);
    }

    validateCancelOrderResponse (response: object, order: object) {
        const result = this.safeDict (response, 'result');
        if ('Ack' in result) {
            const ack = this.safeDict (result, 'Ack');
            const reason = this.safeString (ack, 'reason');
            if (reason !== undefined) {
                this.handleCancelOrderAck (reason, ack);
            }
            return;
        }
        const rejection = this.safeDict (result, 'Rej');
        if (rejection) {
            const rejectReason = this.safeString (rejection, 'reason');
            if (rejectReason !== undefined) {
                this.handleCancelOrderReject (rejectReason, order);
            }
        }
        throw new InvalidOrder ('Cancel order response is invalid: No Ack or Rej found.');
    }

    handleCancelOrderReject (reason: string, order: object) {
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const errorMessage = 'Failed to cancel order ' + clientOrderId + '. ';
        if (reason === '0') {
            throw new InvalidOrder (errorMessage + 'Unclassified error occurred.');
        } else if (reason === '1') {
            throw new InvalidOrder (errorMessage + 'Invalid market ID: The specified market ID does not exist.');
        } else if (reason === '2') {
            throw new InvalidOrder (errorMessage + 'Order not found: The specified client order ID does not exist for the corresponding market ID and subaccount ID.');
        } else {
            throw new InvalidOrder (errorMessage + 'Unknown reason code: ' + reason + '.');
        }
    }

    handleCancelOrderAck (reason: string, ack: object) {
        const clientOrderId = this.safeString (ack, 'clientOrderId');
        const errorMessage = 'Failed to cancel order ' + clientOrderId + '. ';
        if (reason === '0') {
            throw new InvalidOrder (errorMessage + 'Unclassified acknowledgment.');
        } else if (reason === '1') {
            throw new InvalidOrder (errorMessage + 'Order canceled due to disconnection.');
        } else if (reason === '2') {
            throw new InvalidOrder (errorMessage + 'Order was requested to be canceled.');
        } else if (reason === '3') {
            throw new InvalidOrder (errorMessage + 'Immediate or cancel (IOC) order was not fully filled.');
        } else if (reason === '4') {
            throw new InvalidOrder (errorMessage + 'A resting order was canceled due to self-trade prevention (STP).');
        } else if (reason === '5') {
            throw new InvalidOrder (errorMessage + 'An aggressing order was canceled due to self-trade prevention (STP).');
        } else if (reason === '6') {
            throw new InvalidOrder (errorMessage + 'Order was covered by a mass-cancel request.');
        } else if (reason === '7') {
            throw new InvalidOrder (errorMessage + 'Order was canceled because asset position limits would be otherwise breached.');
        } else {
            throw new InvalidOrder (errorMessage + 'Unknown acknowledgment reason code:' + reason + '.');
        }
    }

    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name cube#cancelAllOrders
         * @description cancel all open orders
         * @see https://cubexch.gitbook.io/cube-api/rest-osmium-api#orders-1
         * @param {string} symbol cube cancelAllOrders cannot setting symbol, it will cancel all open orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const meta = await this.fetchMarketMeta (symbol);
        symbol = this.safeString (meta, 'symbol');
        const market = this.safeDict (meta, 'market');
        const rawMarkeId = this.safeInteger (this.safeDict (market, 'info'), 'marketId');
        const request = {
            'marketId': rawMarkeId,
            'requestId': this.safeInteger (params, 'requestId', 1),
            'side': this.safeInteger (params, 'side', undefined),
        };
        this.injectSubAccountId (request, params);
        const response = await this.restOsmiumPrivateDeleteOrders (this.extend (request, params));
        return {
            'info': this.safeDict (response, 'result'),
            'market': market,
        };
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name cube#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://cubexch.gitbook.io/cube-api/rest-osmium-api#orders
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const meta = await this.fetchMarketMeta (symbol);
        symbol = this.safeString (meta, 'symbol');
        const market = this.safeDict (meta, 'market') as Market;
        const order = await this.fetchRawOrder (id, symbol, params);
        //
        //  {
        //      "result": {
        //          "orders": [
        //              {
        //                  "clientOrderId": 1713422528124,
        //                  "exchangeOrderId": 1295024967,
        //                  "marketId": 100006,
        //                  "price": 11000,
        //                  "orderQuantity": 1,
        //                  "side": 0,
        //                  "timeInForce": 1,
        //                  "orderType": 0,
        //                  "remainingQuantity": 1,
        //                  "restTime": 1713422528222471490,
        //                  "subaccountId": 38393,
        //                  "cumulativeQuantity": 0,
        //                  "cancelOnDisconnect": false
        //              },
        //              ...
        //          ]
        //      }
        //  }
        //
        return this.parseOrder (
            {
                'fetchedOrder': order,
                'transactionType': 'fetching',
            },
            market
        );
    }

    async fetchRawOrder (id: string, symbol = undefined, params = {}) {
        /**
         * @method
         * @name cube#fetchRawOrder
         * @description fetches information on an order made by the user
         * @see https://cubexch.gitbook.io/cube-api/rest-osmium-api#orders
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const meta = await this.fetchMarketMeta (symbol);
        symbol = this.safeString (meta, 'symbol');
        const request = {};
        this.injectSubAccountId (request, params);
        const rawResponse = await this.restOsmiumPrivateGetOrders (this.extend (request, params));
        //
        // {
        //    "result": {
        //        "orders": [
        //            {
        //                "clientOrderId": 1713422528124,
        //                "exchangeOrderId": 1295024967,
        //                "marketId": 100006,
        //                "price": 11000,
        //                "orderQuantity": 1,
        //                "side": 0,
        //                "timeInForce": 1,
        //                "orderType": 0,
        //                "remainingQuantity": 1,
        //                "restTime": 1713422528222471490,
        //                "subaccountId": 38393,
        //                "cumulativeQuantity": 0,
        //                "cancelOnDisconnect": false
        //            },
        //            ...
        //        ]
        //    }
        // }
        //
        const result = this.safeList (this.safeDict (rawResponse, 'result'), 'orders');
        let order = undefined;
        for (let i = 0; i < this.countItems (result); i++) {
            const clientOrderId = this.safeString (result[i], 'clientOrderId');
            const exchangeOrderId = this.safeString (result[i], 'exchangeOrderId');
            if (id === clientOrderId || id === exchangeOrderId) {
                order = result[i];
                break;
            }
        }
        return order;
    }

    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name cube#fetchOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const meta = await this.fetchMarketMeta (symbol);
        const market = this.safeMarket (this.safeString (meta, 'marketId'), this.safeDict (meta, 'market') as Market, '/');
        const rawOrders = await this.fetchRawOrders ();
        return this.parseOrders (rawOrders, market, since, limit);
    }

    parseOrders (orders: object, market: Market = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Order[] {
        //
        // the value of orders is either a dict or a list
        //
        // dict
        //
        //     {
        //         'id1': { ... },
        //         'id2': { ... },
        //         'id3': { ... },
        //         ...
        //     }
        //
        // list
        //
        //     [
        //         { 'id': 'id1', ... },
        //         { 'id': 'id2', ... },
        //         { 'id': 'id3', ... },
        //         ...
        //     ]
        //
        let results = [];
        if (Array.isArray (orders)) {
            for (let i = 0; i < orders.length; i++) {
                const order = this.extend (this.parseOrder ({ 'fetchedOrder': orders[i], 'transactionType': 'fetching_all' }, market), params);
                results.push (order);
            }
        } else {
            const ids = Object.keys (orders);
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                const order = this.extend (this.parseOrder ({ 'fetchedOrder': orders[id], 'transactionType': 'fetching_all' }, market), params);
                results.push (order);
            }
        }
        results = this.sortBy (results, 'timestamp');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return this.filterBySymbolSinceLimit (results, symbol, since, limit);
    }

    parseOrder (order, market: Market = undefined) {
        const transactionType = this.safeString (order, 'transactionType');
        let fetchedOrder = this.safeDict (order, 'fetchedOrder');
        let orderStatus = undefined;
        if (transactionType === 'creation') {
            orderStatus = this.safeString (order, 'orderStatus');
            if (orderStatus === 'rejected') {
                throw new InvalidOrder ('Order was rejected');
            }
            if (orderStatus === 'filled') {
                fetchedOrder = this.safeDict (order, 'order');
            }
        } else if (transactionType === 'cancellation') {
            orderStatus = 'canceled';
        } else if (transactionType === 'fetching') {
            orderStatus = 'open'; // If the order is fetched, it is open
        } else if (transactionType === 'fetching_all') {
            orderStatus = this.safeString (fetchedOrder, 'status'); // The order status is present in the order body when fetching the endpoint of all orders
        }
        if (fetchedOrder !== undefined) {
            if (!market) {
                market = this.options['mappings']['rawMarketsIdsToMarkets'][this.parseToNumeric (fetchedOrder['marketId'])];
            }
            const exchangeOrderId = this.safeString (fetchedOrder, 'exchangeOrderId');
            const clientOrderId = this.safeString (fetchedOrder, 'clientOrderId');
            let timestampInNanoseconds = undefined;
            timestampInNanoseconds = this.safeInteger (fetchedOrder, 'restTime');
            if (timestampInNanoseconds === undefined) {
                timestampInNanoseconds = this.safeInteger (fetchedOrder, 'transactTime');
            }
            if (timestampInNanoseconds === undefined) {
                timestampInNanoseconds = this.safeInteger (fetchedOrder, 'createdAt');
            }
            if (timestampInNanoseconds === undefined) {
                timestampInNanoseconds = this.safeInteger (fetchedOrder, 'filledAt');
            }
            if (timestampInNanoseconds === undefined) {
                timestampInNanoseconds = this.safeInteger (fetchedOrder, 'canceledAt');
            }
            const timestampInMilliseconds = this.parseToInt (timestampInNanoseconds / 1000000);
            const symbol = this.safeString (market, 'symbol');
            const orderSideRaw = this.safeInteger (fetchedOrder, 'side');
            let orderSide = undefined;
            if (orderSideRaw === 0) {
                orderSide = 'buy';
            } else {
                orderSide = 'sell';
            }
            let currency = undefined;
            if (orderSide === 'buy') {
                currency = this.safeString (market, 'base');
            } else {
                currency = this.safeString (market, 'quote');
            }
            const orderTypeRaw = this.safeInteger (fetchedOrder, 'orderType');
            let orderType = undefined;
            if (orderTypeRaw === 0) {
                orderType = 'limit';
            } else if (orderTypeRaw === 1) {
                orderType = 'market';
            } else if (orderTypeRaw === 2) {
                orderType = 'MARKET_WITH_PROTECTION';
            }
            let timeInForce = undefined;
            const timeInForceRaw = this.safeInteger (fetchedOrder, 'timeInForce');
            if (timeInForceRaw === 0) {
                timeInForce = 'IOC';
            } else if (timeInForceRaw === 1) {
                timeInForce = 'GTC';
            } else if (timeInForceRaw === 2) {
                timeInForce = 'FOK';
            }
            const priceTickSize = this.parseToNumeric (this.safeValue (this.safeDict (market, 'info'), 'priceTickSize'));
            const rawPrice = this.safeInteger (fetchedOrder, 'price');
            let price = undefined;
            if (rawPrice === undefined || orderType === 'market') {
                price = 0;
            } else {
                if (priceTickSize && priceTickSize !== 0) {
                    price = rawPrice * priceTickSize;
                }
            }
            let amount = undefined;
            amount = this.safeInteger (fetchedOrder, 'quantity');
            if (amount === undefined) {
                amount = this.safeInteger (fetchedOrder, 'qty');
            }
            if (amount === undefined) {
                amount = this.safeInteger (fetchedOrder, 'orderQuantity');
            }
            let remainingAmount = undefined;
            remainingAmount = this.safeInteger (fetchedOrder, 'remainingQuantity');
            if (remainingAmount === undefined && (orderStatus === 'canceled' || orderStatus === 'filled')) {
                remainingAmount = amount;
            }
            if (remainingAmount === undefined) {
                remainingAmount = 0;
            }
            const filledAmount = amount - remainingAmount;
            const tradeFeeRatios = this.safeDict (this.fees, 'trading');
            let rate = undefined;
            if (orderSide === 'buy') {
                rate = this.safeNumber (tradeFeeRatios, 'maker');
            } else if (orderSide === 'sell') {
                rate = this.safeNumber (tradeFeeRatios, 'taker');
            }
            const quantityTickSize = this.parseToNumeric (this.safeValue (this.safeDict (market, 'info'), 'quantityTickSize'));
            let decimalAmount = 0;
            let decimalFilledAmount = 0;
            let decimalRemainingAmount = 0;
            if (quantityTickSize && quantityTickSize !== 0) {
                decimalAmount = amount * quantityTickSize;
                decimalFilledAmount = filledAmount * quantityTickSize;
                decimalRemainingAmount = remainingAmount * quantityTickSize;
            }
            const cost = decimalFilledAmount * price;
            const feeCost = decimalAmount * rate;
            // let average = undefined;
            // if (price !== undefined && price.toString ().split ('.').length === 1) {
            //     average = this.parseToNumeric (price.toString () + '.0000001');
            // } else {
            //     average = price;
            // }
            const finalOrder = {
                'id': exchangeOrderId,
                'clientOrderId': clientOrderId,
                'datetime': this.iso8601 (timestampInMilliseconds),
                'timestamp': timestampInMilliseconds,
                'lastTradeTimestamp': timestampInMilliseconds,
                'status': orderStatus,
                'symbol': symbol,
                'type': orderType,
                'timeInForce': timeInForce,
                'side': orderSide,
                'price': price,
                'average': undefined,
                'amount': decimalAmount,
                'filled': decimalFilledAmount,
                'remaining': decimalRemainingAmount,
                'cost': cost,
                'trades': [],
                'fee': {
                    'currency': currency, // a deduction from the asset hasattr(this, received) trade
                    'cost': feeCost,
                    'rate': rate,
                },
                'info': {
                    'fetchedOrder': fetchedOrder,
                },
            };
            finalOrder['fees'] = this.safeDict (finalOrder, 'fee');
            return this.safeOrder (finalOrder);
        } else {
            throw new OrderNotFound ('Order not found');
        }
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name cube#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const meta = await this.fetchMarketMeta (symbol);
        const market = this.safeDict (meta, 'market');
        const request = {};
        this.injectSubAccountId (request, params);
        const response = await this.restOsmiumPrivateGetOrders (this.extend (request, params));
        const rawOrders = this.safeList (this.safeDict (response, 'result'), 'orders');
        return this.parseOrders (rawOrders, market as Market, since, limit);
    }

    async fetchRawOrders () {
        /**
         * @method
         * @name cube#fetchRawOrders
         * @description fetch all orders from all markets
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {};
        this.injectSubAccountId (request, {});
        const response = await this.restIridiumPrivateGetUsersSubaccountSubaccountIdOrders (this.extend (request));
        const rawOrders = this.safeList (this.safeDict (response, 'result'), 'orders');
        return rawOrders;
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name cube#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://cubexch.gitbook.io/cube-api/rest-mendelev-api#book-market_id-recent-trades
         * @see https://cubexch.gitbook.io/cube-api/rest-mendelev-api#parsed-book-market_symbol-recent-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum number of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} params.lastId order id
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        const meta = await this.fetchMarketMeta (symbol);
        symbol = this.safeString (meta, 'symbol');
        const market = this.safeDict (meta, 'market') as any;
        const rawMarketId = this.safeString (this.safeDict (market, 'info'), 'marketId');
        const rawMarketSymbol = this.safeString (this.safeDict (market, 'info'), 'symbol');
        let request = undefined;
        request = {
            'market_id': rawMarketId,
        };
        const recentTradesResponse = await this.restMendelevPublicGetBookMarketIdRecentTrades (this.extend (request, params));
        //
        // {
        //     "result":{
        //         "trades":[
        //             {
        //                 "tradeId":1192726,
        //                 "price":25730,
        //                 "aggressingSide":1,
        //                 "restingExchangeOrderId":775000423,
        //                 "fillQuantity":2048,
        //                 "transactTime":1710261845127064300,
        //                 "aggressingExchangeOrderId":775000298
        //             },
        //             {
        //                 "tradeId":1192723,
        //                 "price":25730,
        //                 "aggressingSide":0,
        //                 "restingExchangeOrderId":775000298,
        //                 "fillQuantity":5000,
        //                 "transactTime":1710261844303742500,
        //                 "aggressingExchangeOrderId":774996895
        //             }
        //         ]
        //     }
        // }
        //
        request = {
            'market_symbol': rawMarketSymbol,
        };
        const parsedRecentTradesResponse = await this.restMendelevPublicGetParsedBookMarketSymbolRecentTrades (this.extend (request, params));
        //
        // {
        //     "result":{
        //         "ticker_id":"BTCUSDC",
        //         "trades":[
        //             {
        //                 "id":1106939,
        //                 "p":63565.6,
        //                 "q":0.01,
        //                 "side":"Ask",
        //                 "ts":1711153560907
        //             },
        //             {
        //                 "id":1107084,
        //                 "p":63852.9,
        //                 "q":0.01,
        //                 "side":"Bid",
        //                 "ts":1711156552440
        //             }
        //         ]
        //     }
        // }
        //
        const tradesAndParsedTrades = {
            'trades': this.safeList (this.safeDict (recentTradesResponse, 'result'), 'trades'),
            'parsedTrades': this.safeList (this.safeDict (parsedRecentTradesResponse, 'result'), 'trades'),
        };
        const rawTrades = [ tradesAndParsedTrades ];
        const parsedTrades = this.parseTrades (rawTrades, market);
        return this.filterBySymbolSinceLimit (parsedTrades, symbol, since, limit);
    }

    parseTrades (trades, market: Market = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Trade[] {
        const parsedTrades = this.safeValue (trades[0], 'parsedTrades');
        const finalTrades = [];
        if (parsedTrades !== undefined && this.countItems (parsedTrades) > 0) {
            for (let i = 0; i < this.countItems (parsedTrades); i++) {
                const trade = parsedTrades[i];
                finalTrades.push (this.parseTrade (trade, market));
            }
        }
        return finalTrades;
    }

    parseTrade (trade, market = undefined) {
        let timestampSeconds = 0;
        if (trade['ts'] !== undefined) {
            timestampSeconds = this.safeInteger (trade, 'ts');
        } else if (trade['transactTime'] !== undefined) {
            const timestampNanoseconds = trade['transactTime'];
            timestampSeconds = timestampNanoseconds / 1000000;
        }
        const datetime = this.iso8601 (timestampSeconds);
        const tradeSide = this.safeString (trade, 'side');
        let side = '';
        if (tradeSide === 'Bid') {
            side = 'buy';
        } else if (tradeSide === 'Ask') {
            side = 'sell';
        }
        const marketSymbol = this.safeString (market, 'symbol');
        const price = parseFloat (this.safeString (trade, 'p'));
        const amount = parseFloat (this.safeString (trade, 'q'));
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestampSeconds,
            'datetime': datetime,
            'symbol': marketSymbol,
            'id': this.safeString (trade, 'id'),
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
            'fees': [
                {
                    'cost': undefined,
                    'currency': undefined,
                    'rate': undefined,
                },
            ],
        }, market);
    }

    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        /**
         * @method
         * @name cube#fetchTradingFee
         * @description fetch the trading fees for a market
         * @see https://cubexch.gitbook.io/cube-api/rest-iridium-api#users-fee-estimate-market-id
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        const meta = await this.fetchMarketMeta (symbol);
        symbol = this.safeString (meta, 'symbol');
        const market = this.safeDict (meta, 'market');
        const rawMarketId = this.safeInteger (this.safeDict (market, 'info'), 'marketId');
        const request = {
            'market_id': rawMarketId,
        };
        const response = await this.restIridiumPrivateGetUsersFeeEstimateMarketId (this.extend (request, params));
        // {
        //     "result": {
        //         "userKey": "123e4567-e89b-12d3-a456-426614174000",
        //         "makerFeeRatio": 0,
        //         "takerFeeRatio": 0
        //     }
        // }
        return {
            'info': response,
            'symbol': symbol,
            'maker': this.safeNumber (this.safeDict (response, 'result'), 'makerFeeRatio'),
            'taker': this.safeNumber (this.safeDict (response, 'result'), 'takerFeeRatio'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name cube#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://cubexch.gitbook.io/cube-api/rest-iridium-api#users-subaccount-subaccount_id-fills
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        const meta = await this.fetchMarketMeta (symbol);
        symbol = this.safeString (meta, 'symbol');
        const allOrders = await this.fetchOrders (symbol, since, limit, params);
        const myTrades = [];
        for (let i = 0; i < this.countItems (allOrders); i++) {
            const orderStatus = this.safeString (allOrders[i], 'status');
            if (orderStatus === 'filled') {
                const orderFills = this.safeList (this.safeDict (this.safeDict (allOrders[i], 'info'), 'fetchedOrder'), 'fills');
                const fillsLength = this.countItems (orderFills);
                for (let j = 0; j < fillsLength; j++) {
                    const trade = orderFills[j];
                    const parsedTrade = await this.parseMyTrade (trade, allOrders[i]);
                    myTrades.push (parsedTrade);
                }
            }
        }
        return this.filterBySymbolSinceLimit (myTrades, symbol, since, limit);
    }

    async parseMyTrade (trade, order) {
        const tradeId = this.safeString (trade, 'tradeId');
        const timestampInNanoseconds = this.safeInteger (trade, 'filledAt');
        const timestampInMilliseconds = this.parseToInt (timestampInNanoseconds / 1000000);
        const datetime = this.iso8601 (timestampInMilliseconds);
        const meta = await this.fetchMarketMeta (this.safeString (order, 'symbol'));
        const marketSymbol = this.safeString (meta, 'symbol');
        const orderType = this.safeString (order, 'type');
        let orderId = undefined;
        if (orderType === 'limit') {
            orderId = this.safeString (order, 'id');
        } else if (orderType === 'market') {
            orderId = this.safeString (order, 'clientOrderId');
        }
        const orderSide = this.safeString (order, 'side');
        const timeInForce = this.safeString (order, 'timeInForce');
        let takerOrMaker = undefined;
        if (orderType === 'market' || timeInForce === 'IOC' || timeInForce === 'FOK') {
            takerOrMaker = 'taker';
        } else {
            takerOrMaker = 'maker';
        }
        const orderPrice = this.safeNumber (order, 'price');
        const orderAmount = this.safeNumber (order, 'amount');
        let cost = undefined;
        if (orderPrice !== undefined) {
            cost = orderPrice * orderAmount;
        }
        const fee = this.safeDict (order, 'fee');
        const fees = this.safeList (order, 'fees');
        return {
            'id': tradeId,
            'timestamp': timestampInMilliseconds,
            'datetime': datetime,
            'symbol': marketSymbol,
            'order': orderId,
            'type': orderType,
            'side': orderSide,
            'takerOrMaker': takerOrMaker,
            'price': orderPrice,
            'amount': orderAmount,
            'cost': cost,
            'fee': fee,
            'fees': fees,
            'info': order,
        };
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name cube#fetchClosedOrders
         * @description fetches a list of closed (or canceled) orders
         * @see https://github.com/ccxt/ccxt/wiki/Manual#understanding-the-orders-api-design
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const allOrders = await this.fetchOrders (symbol, since, limit, params);
        const closedOrders = [];
        for (let i = 0; i < this.countItems (allOrders); i++) {
            const orderStatus = this.safeString (allOrders[i], 'status');
            if (orderStatus === 'canceled' || orderStatus === 'closed') {
                closedOrders.push (allOrders[i]);
            }
        }
        return closedOrders;
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name cube#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @see https://binance-docs.github.io/apidocs/spot/en/#system-status-system
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.restIridiumPublicGetMarkets (params);
        const keys = Object.keys (response);
        const keysLength = keys.length;
        let formattedStatus = undefined;
        if (keysLength) {
            formattedStatus = 'ok';
        } else {
            formattedStatus = 'maintenance';
        }
        return {
            'status': formattedStatus,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': undefined,
        };
    }

    async fetchDeposits (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name cube#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.fetchMarketMeta ();
        const request = {};
        let currency = undefined;
        if (symbol !== undefined) {
            currency = this.currency (symbol);
            request['asset_symbol'] = this.safeString (this.safeDict (currency, 'info'), 'assetId');
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        this.injectSubAccountId (request, params);
        const subAccountId = this.safeString (request, 'subaccountId');
        const response = await this.restIridiumPrivateGetUsersSubaccountSubaccountIdDeposits (this.extend (request, params));
        //
        // result: {
        //     "161": {
        //       name: "primary",
        //       inner: [
        //         {
        //           assetId: 80005,
        //           amount: "5000000000",
        //           txnHash: "5E8xrkpCdwsczNDqGcezQ6agxDoFjXN9YVQFE4ZDk7vcdmdQHbPRSw7z3F769kkg4F57Vh4HsAsaKeFt8Z7qHhjZ",
        //           txnIndex: 1,
        //           createdAt: "2024-03-27T23:51:14.933108Z",
        //           updatedAt: "2024-03-27T23:51:28.93706Z",
        //           txnState: "confirmed",
        //           kytStatus: "accept",
        //           address: "79xoQgxNgKbjDrwp3Gb6t1oc1NmcgZ3PQFE7i1XCrk5x",
        //           fiatToCrypto: false,
        //         },
        //       ],
        //     },
        //   },
        //
        const deposits = this.safeList (this.safeDict (this.safeDict (response, 'result'), subAccountId), 'inner', []);
        for (let i = 0; i < deposits.length; i++) {
            deposits[i]['type'] = 'deposit';
        }
        return this.parseTransactions (deposits, currency, since, limit, params);
    }

    async fetchDepositAddresses (codes: Strings = undefined, params = {}) {
        /**
         * @method
         * @name cube#fetchDepositAddresses
         * @description fetch deposit addresses for multiple currencies and chain types
         * @see https://cubexch.gitbook.io/cube-api/rest-iridium-api#users-info
         * @param {string[]|undefined} codes list of unified currency codes, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.fetchMarketMeta ();
        const rawUsersInfoResponse = await this.restIridiumPrivateGetUsersInfo (params);
        const rawMarketsResponse = await this.restIridiumPublicGetMarkets (params);
        //
        // getUsersInfo
        // {
        //     ...
        //     "subaccounts": [
        //         {
        //             "id": 161,
        //             "name": "primary",
        //             "addresses": {
        //                 "101": "tb1p74t28ne95z0rptyhqfwzx8xh2xclw4t2ua46fyzqr6x76km7sp8qdy2n3e",
        //                 "103": "Cz3BnXPhYudZscqHHh5eDusYzVn4Bpb5EKBvrG4Zvaf3",
        //                 "105": "nf8FjTqGW4B7Bx5UZhkRUhaGGnMjZ7LUPw",
        //                 "106": "5G6AHKi87NCNkFvPfXx4aX3qLcoKzWRTK4KcHNPeVPB6qZyT",
        //                 "107": "tltc1qwlky3uxaygw4g3yr39cw0xvzw323xynmunuca3",
        //                 "108": "cosmos1wlky3uxaygw4g3yr39cw0xvzw323xynme8m7jx"
        //             },
        //             "hasOrderHistory": true
        //         }
        //     ]
        //     ...
        // }
        //
        // getMarkets
        // {
        //     ...
        //     sources: [
        //        {
        //            sourceId: 1,
        //            name: "bitcoin",
        //            transactionExplorer: "https://mempool.space/tx/{}",
        //            addressExplorer: "https://mempool.space/address/{}",
        //            metadata: {
        //              network: "Mainnet",
        //              scope: "bitcoin",
        //              type: "mainnet",
        //           },
        //        },
        //     ]
        //     ...
        // }
        if (codes === undefined) {
            codes = [];
        }
        const newCodes = [];
        for (let i = 0; i < codes.length; i++) {
            newCodes[i] = codes[i].toUpperCase ();
        }
        codes = newCodes;
        const sourcesByIds = {};
        const sources = this.safeList (rawMarketsResponse, 'sources', []);
        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            const sourceId = this.safeString (source, 'sourceId');
            sourcesByIds[sourceId] = source;
        }
        const subAccounts = this.safeList (rawUsersInfoResponse, 'subaccounts', []);
        const result = {
            'info': {
                'subaccounts': subAccounts,
                'sources': sources,
            },
        };
        for (let i = 0; i < subAccounts.length; i++) {
            const subAccount = subAccounts[i];
            const subAccountId = this.safeString (subAccount, 'id');
            const addresses = this.safeList (subAccount, 'addresses', []);
            const sourcesIds = Object.keys (addresses);
            for (let j = 0; j < sourcesIds.length; j++) {
                const sourceId = sourcesIds[j];
                const address = addresses[sourceId];
                this.checkAddress (address);
                const source = this.safeString (sourcesByIds, sourceId);
                const currency = this.currency (this.safeString (source, 'name'));
                const sourceMetaData = this.safeDict (source, 'metadata');
                const network = this.safeString (sourceMetaData, 'scope') + '-' + this.safeString (sourceMetaData, 'type');
                const currencyCode = this.safeString (currency, 'code');
                if (!this.inArray (currencyCode, codes)) {
                    continue;
                }
                result[currencyCode] = {
                    'info': {
                        'subaccount': subAccount,
                        'source': source,
                    },
                    'currency': currencyCode,
                    'address': address,
                    'network': network,
                    'tag': subAccountId,
                };
            }
        }
        return result;
    }

    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}): Promise<Transaction> {
        /**
         * @method
         * @name cube#withdraw
         * @description make a withdrawal
         * @see https://cubexch.gitbook.io/cube-api/rest-iridium-api#users-withdraw
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.fetchMarketMeta ();
        const currency = this.currency (code);
        const currencyPrecision = this.safeInteger (currency, 'precision');
        const exchangeAmount = Math.round (amount * Math.pow (10, currencyPrecision));
        const request = {
            'amount': this.numberToString (exchangeAmount),
            'destination': address,
            'assetId': this.safeInteger (currency, 'numericId'),
        };
        this.injectSubAccountId (request, params);
        const response = await this.restIridiumPrivatePostUsersWithdraw (this.extend (request, params));
        //
        // {
        //     "result": {
        //       "status": "pending",
        //       "approved": false,
        //       "reason": "text"
        //     }
        //     "result": {
        //     "status": "accept",
        //     "approved": true
        //    }
        // }
        //
        return response;
    }

    async fetchWithdrawals (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name cube#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.fetchMarketMeta ();
        const request = {};
        let currency = undefined;
        if (symbol !== undefined) {
            currency = this.currency (symbol);
            request['assetId'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        this.injectSubAccountId (request, params);
        const subAccountId = this.safeString (request, 'subaccountId');
        const response = await this.restIridiumPrivateGetUsersSubaccountSubaccountIdWithdrawals (this.extend (request, params));
        //
        // result: {
        //     "161": {
        //       name: "primary",
        //       inner: [
        //         {
        //           assetId: 80005,
        //           amount: "100000000",
        //           createdAt: "2024-05-02T18:03:36.779453Z",
        //           updatedAt: "2024-05-02T18:03:37.941902Z",
        //           attemptId: 208,
        //           address: "6khUqefutr3xA6fEUnZfRMRGwER8BBTZZFFgBPhuUyyp",
        //           kytStatus: "accept",
        //           approved: true,
        //         },
        //       ],
        //     },
        //   },
        //
        const withdrawals = this.safeList (this.safeDict (this.safeDict (response, 'result'), subAccountId), 'inner', []);
        for (let i = 0; i < withdrawals.length; i++) {
            withdrawals[i]['type'] = 'withdrawal';
        }
        return this.parseTransactions (withdrawals, currency, since, limit, params);
    }

    parseTransaction (transaction, currency: Currency = undefined): Transaction {
        //
        // fetchDeposits
        //
        // result: {
        //     "161": {
        //       name: "primary",
        //       inner: [
        //         {
        //           assetId: 80005,
        //           amount: "5000000000",
        //           txnHash: "5E8xrkpCdwsczNDqGcezQ6agxDoFjXN9YVQFE4ZDk7vcdmdQHbPRSw7z3F769kkg4F57Vh4HsAsaKeFt8Z7qHhjZ",
        //           txnIndex: 1,
        //           createdAt: "2024-03-27T23:51:14.933108Z",
        //           updatedAt: "2024-03-27T23:51:28.93706Z",
        //           txnState: "confirmed",
        //           kytStatus: "accept",
        //           address: "79xoQgxNgKbjDrwp3Gb6t1oc1NmcgZ3PQFE7i1XCrk5x",
        //           fiatToCrypto: false,
        //         },
        //       ],
        //     },
        //   },
        //
        // fetchWithdrawals
        //
        // result: {
        //     "161": {
        //       name: "primary",
        //       inner: [
        //         {
        //           assetId: 80005,
        //           amount: "100000000",
        //           createdAt: "2024-05-02T18:03:36.779453Z",
        //           updatedAt: "2024-05-02T18:03:37.941902Z",
        //           attemptId: 208,
        //           address: "6khUqefutr3xA6fEUnZfRMRGwER8BBTZZFFgBPhuUyyp",
        //           kytStatus: "accept",
        //           approved: true,
        //         },
        //       ],
        //     },
        //   },
        //
        // TODO Expose this object globally for the exchange so the currencies can be retrieved in O(1) time!!!
        const currenciesByNumericId = {};
        for (let i = 0; i < this.countItems (this.currencies); i++) {
            const currenciesKeysArray = Object.keys (this.currencies);
            const targetCurrency = this.safeValue (this.currencies, currenciesKeysArray[i]);
            const targetCurrencyNumericId = this.safeInteger (targetCurrency, 'numericId');
            currenciesByNumericId[targetCurrencyNumericId] = targetCurrency;
        }
        const id = this.safeString (transaction, 'attemptId');
        const txId = this.safeString (transaction, 'txnHash');
        const code = this.safeString (currenciesByNumericId[this.safeInteger (transaction, 'assetId')], 'code');
        const timestamp = this.parse8601 (this.safeString (transaction, 'createdAt'));
        const updated = this.parse8601 (this.safeString (transaction, 'updatedAt'));
        const status = this.parseTransactionStatus (this.safeString (transaction, 'kytStatus'));
        const address = this.safeString (transaction, 'address');
        const type = this.safeString (transaction, 'type', undefined);
        const assetAmount = this.parseToNumeric (this.safeString (transaction, 'amount'));
        const assetNumericId = this.parseToInt (this.safeString (transaction, 'assetId'));
        currency = currenciesByNumericId[assetNumericId];
        const currencyPrecision = this.safeInteger (currency, 'precision');
        const amount = assetAmount / Math.pow (10, currencyPrecision);
        return {
            'info': transaction,
            'id': id,
            'txid': txId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': undefined,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': undefined,
            'comment': undefined,
            'internal': undefined,
        } as Transaction;
    }

    parseTransactionStatus (status) {
        const statuses = {
            // what are other statuses here?
            'WITHHOLD': 'ok',
            'UNCONFIRMED': 'pending',
            'CONFIRMED': 'ok',
            'COMPLETED': 'ok',
            'PENDING': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    countWithLoop (items) {
        let counter = 0;
        for (let i = 0; i < items.length; i++) {
            counter += 1;
        }
        return counter;
    }

    countItems (input) {
        let counter = 0;
        if (Array.isArray (input)) {
            counter = this.countWithLoop (input);
        } else if (typeof input === 'object' && input !== undefined) {
            const keys = Object.keys (input);
            counter = this.countWithLoop (keys);
        } else if (typeof input === 'string') {
            counter = this.countWithLoop (this.stringToCharsArray (input));
        }
        return counter;
    }
}
