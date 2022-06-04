'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest, BadSymbol, InvalidOrder, InvalidAddress, ExchangeError, ArgumentsRequired, NotSupported, InsufficientFunds } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class mexc3 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mexc3',
            'name': 'MEXC Global',
            'countries': [ 'SC' ], // Seychelles
            'rateLimit': 50, // default rate limit is 20 times per second
            'version': 'v3',
            'has': {
                'CORS': undefined,
                'spot': undefined,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': undefined,
                'createDepositAddress': undefined,
                'createLimitOrder': undefined,
                'createMarketOrder': undefined,
                'createOrder': true,
                'deposit': undefined,
                'editOrder': undefined,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRates': undefined,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchCanceledOrders': true,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposit': undefined,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': undefined,
                'fetchIndexOHLCV': true,
                'fetchL2OrderBook': true,
                'fetchLedger': undefined,
                'fetchLedgerEntry': undefined,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': undefined,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': undefined,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': undefined,
                'fetchTradingFees': true,
                'fetchTradingLimits': undefined,
                'fetchTransactionFee': undefined,
                'fetchTransactionFees': undefined,
                'fetchTransactions': undefined,
                'fetchTransfer': true,
                'fetchTransfers': true,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': true,
                'loadMarkets': undefined,
                'privateAPI': true,
                'publicAPI': true,
                'reduceMargin': true,
                'setLeverage': true,
                'setMarginMode': undefined,
                'setPositionMode': undefined,
                'signIn': undefined,
                'transfer': undefined,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg',
                'api': {
                    'spot': {
                        'public': 'https://api.mexc.com',
                        'private': 'https://api.mexc.com',
                    },
                    'spot2': {
                        'public': 'https://www.mexc.com/open/api/v2',
                        'private': 'https://www.mexc.com/open/api/v2',
                    },
                    'contract': {
                        'public': 'https://contract.mexc.com/api/v1/contract',
                        'private': 'https://contract.mexc.com/api/v1/private',
                    },
                },
                'www': 'https://www.mexc.com/',
                'doc': [
                    'https://mxcdevelop.github.io/apidocs/spot_v3_en/',
                    'https://mxcdevelop.github.io/APIDoc/', // v1 & v2 : soon to be deprecated
                ],
                'fees': [
                    'https://www.mexc.com/fee',
                ],
                'referral': 'https://m.mexc.com/auth/signup?inviteCode=1FQ1G',
            },
            'api': {
                'spot': {
                    'public': {
                        'get': {
                            'ping': 1,
                            'time': 1,
                            'exchangeInfo': 1,
                            'depth': 1,
                            'trades': 1,
                            'historicalTrades': 1,
                            'aggTrades': 1,
                            'klines': 1,
                            'avgPrice': 1,
                            'ticker/24hr': 1,
                            'ticker/price': 1,
                            'ticker/bookTicker': 1,
                            'etf/info': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'order': 1,
                            'openOrders': 1,
                            'allOrders': 1,
                            'account': 1,
                            'myTrades': 1,
                            'sub-account/list': 1,
                            'sub-account/apiKey': 1,
                        },
                        'post': {
                            'order': 1,
                            'order/test': 1,
                            'sub-account/virtualSubAccount': 1,
                            'sub-account/apiKey': 1,
                        },
                        'delete': {
                            'order': 1,
                            'openOrders': 1,
                            'sub-account/apiKey': 1,
                        },
                    },
                },
                'contract': {
                    'public': {
                        'get': {
                            'ping': 2,
                            'detail': 2,
                            'support_currencies': 2, // TODO: should we implement 'fetchCurrencies' solely for swap? because spot doesnt have it atm
                            'depth/{symbol}': 2,
                            'depth_commits/{symbol}/{limit}': 2,
                            'index_price/{symbol}': 2,
                            'fair_price/{symbol}': 2,
                            'funding_rate/{symbol}': 2,
                            'kline/{symbol}': 2,
                            'kline/index_price/{symbol}': 2,
                            'kline/fair_price/{symbol}': 2,
                            'deals/{symbol}': 2,
                            'ticker': 2,
                            'risk_reverse': 2,
                            'risk_reverse/history': 2,
                            'funding_rate/history': 2,
                        },
                    },
                    'private': {
                        'get': {
                            'account/assets': 2,
                            'account/asset/{currency}': 2,
                            'account/transfer_record': 2,
                            'position/list/history_positions': 2,
                            'position/open_positions': 2,
                            'position/funding_records': 2,
                            'order/list/open_orders/{symbol}': 2,
                            'order/list/history_orders': 2,
                            'order/external/{symbol}/{external_oid}': 2,
                            'order/get/{order_id}': 2,
                            'order/batch_query': 8,
                            'order/deal_details/{order_id}': 2,
                            'order/list/order_deals': 2,
                            'planorder/list/orders': 2,
                            'stoporder/list/orders': 2,
                            'stoporder/order_details/{stop_order_id}': 2,
                            'account/risk_limit': 2, // TO_DO: gets max/min position size, allowed sides, leverage, maintenance margin, initial margin, etc...
                            'account/tiered_fee_rate': 2, // TO_DO: taker/maker fees for account
                        },
                        'post': {
                            'position/change_margin': 2,
                            'position/change_leverage': 2,
                            'order/submit': 2,
                            'order/submit_batch': 40,
                            'order/cancel': 2,
                            'order/cancel_with_external': 2,
                            'order/cancel_all': 2,
                            'account/change_risk_level': 2,
                            'planorder/place': 2,
                            'planorder/cancel': 2,
                            'planorder/cancel_all': 2,
                            'stoporder/cancel': 2,
                            'stoporder/cancel_all': 2,
                            'stoporder/change_price': 2,
                            'stoporder/change_plan_price': 2,
                        },
                    },
                },
                'spot2': {
                    'public': {
                        'get': {
                            'market/symbols': 1,
                            'market/coin/list': 2,
                            'common/timestamp': 1,
                            'common/ping': 1,
                            'market/ticker': 1,
                            'market/depth': 1,
                            'market/deals': 1,
                            'market/kline': 1,
                            'market/api_default_symbols': 2,
                        },
                    },
                    'private': {
                        'get': {
                            'account/info': 1,
                            'order/open_orders': 1,
                            'order/list': 1,
                            'order/query': 1,
                            'order/deals': 1,
                            'order/deal_detail': 1,
                            'asset/deposit/address/list': 2,
                            'asset/deposit/list': 2,
                            'asset/address/list': 2,
                            'asset/withdraw/list': 2,
                            'asset/internal/transfer/record': 10,
                            'account/balance': 10,
                            'asset/internal/transfer/info': 10,
                            'market/api_symbols': 2,
                        },
                        'post': {
                            'order/place': 1,
                            'order/place_batch': 1,
                            'asset/withdraw': 2,
                            'asset/internal/transfer': 10,
                        },
                        'delete': {
                            'order/cancel': 1,
                            'order/cancel_by_symbol': 1,
                            'asset/withdraw': 2,
                        },
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'timeframes': {
                '1m': '1m', // spot, swap
                '3m': '3m', // spot
                '5m': '5m', // spot, swap
                '15m': '15m', // spot, swap
                '30m': '30m', // spot, swap
                '1h': '1h', // spot, swap
                '2h': '2h', // spot
                '4h': '4h', // spot, swap
                '6h': '6h', // spot
                '8h': '8h', // spot, swap
                '12h': '12h', // spot
                '1d': '1d', // spot, swap
                '3d': '3d', // spot
                '1w': '1w', // spot, swap
                '1M': '1M', // spot, swap
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100, // maker / taker
                    'taker': 0.2 / 100,
                },
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'unavailableContracts': {
                    'BTC/USDT:USDT': true,
                    'LTC/USDT:USDT': true,
                    'ETH/USDT:USDT': true,
                },
                'fetchMarkets': {
                    'types': {
                        'spot': true,
                        'future': {
                            'linear': false,
                            'inverse': false,
                        },
                        'swap': {
                            'linear': true,
                            'inverse': false,
                        },
                    },
                },
                'timeframes': {
                    'spot': {
                        '1m': '1m',
                        '3m': '3m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '1h',
                        '2h': '2h',
                        '4h': '4h',
                        '6h': '6h',
                        '8h': '8h',
                        '12h': '12h',
                        '1d': '1d',
                        '3d': '3d',
                        '1w': '1w',
                        '1M': '1M',
                    },
                    'swap': {
                        '1m': 'Min1',
                        '5m': 'Min5',
                        '15m': 'Min15',
                        '30m': 'Min30',
                        '1h': 'Min60',
                        '4h': 'Hour4',
                        '8h': 'Hour8',
                        '1d': 'Day1',
                        '1w': 'Week1',
                        '1M': 'Month1',
                    },
                },
                'defaultType': 'spot', // spot, swap
                'networks': {
                    'TRX': 'TRC-20',
                    'TRC20': 'TRC-20',
                    'ETH': 'ERC-20',
                    'ERC20': 'ERC-20',
                    'BEP20': 'BEP20(BSC)',
                    'BSC': 'BEP20(BSC)',
                },
                'networkAliases': {
                    'BSC(BEP20)': 'BSC',
                },
                'recvWindow': 5 * 1000, // 5 sec, default
                'maxTimeTillEnd': 90 * 86400 * 1000 - 1, // 90 days
            },
            'commonCurrencies': {
                'BEYONDPROTOCOL': 'BEYOND',
                'BIFI': 'BIFIF',
                'BYN': 'BeyondFi',
                'COFI': 'COFIX', // conflict with CoinFi
                'DFI': 'DfiStarter',
                'DFT': 'dFuture',
                'DRK': 'DRK',
                'EGC': 'Egoras Credit',
                'FLUX1': 'FLUX', // switched places
                'FLUX': 'FLUX1', // switched places
                'FREE': 'FreeRossDAO', // conflict with FREE Coin
                'HERO': 'Step Hero', // conflict with Metahero
                'MIMO': 'Mimosa',
                'PROS': 'Pros.Finance', // conflict with Prosper
                'SIN': 'Sin City Token',
            },
            'exceptions': {
                'exact': {
                    // until mexc migrates fully to v3, it might be worth to note the version & market aside errors, not easily remove obsolete version's exceptions in future
                    '-1128': BadRequest,
                    '-2011': BadRequest,
                    '-1121': BadSymbol,
                    '2011': BadRequest,
                    '30004': InsufficientFunds,
                    '1002': InvalidOrder,
                    '30019': BadRequest,
                    '30005': InvalidOrder,
                    '2003': InvalidOrder,
                    '2005': InsufficientFunds,
                    '600': BadRequest,
                },
                'broad': {
                    'Order quantity error, please try to modify.': BadRequest, // code:2011
                    'Combination of optional parameters invalid': BadRequest, // code:-2011
                    'api market order is disabled': BadRequest, //
                    'Contract not allow place order!': InvalidOrder, // code:1002
                    'Oversold': InvalidOrder, // code:30005
                    'Insufficient position': InsufficientFunds, // code:30004
                    'Insufficient balance!': InsufficientFunds, // code:2005
                    'Bid price is great than max allow price': InvalidOrder, // code:2003
                    'Invalid symbol.': BadSymbol, // code:-1121
                    'Param error!': BadRequest, // code:600
                },
            },
        });
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name mexc3#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {dict} params extra parameters specific to the mexc3 api endpoint
         * @returns {dict} a [status structure]{@link https://docs.ccxt.com/en/latest/manual.html#exchange-status-structure}
         */
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchStatus', undefined, params);
        let response = undefined;
        let status = undefined;
        let updated = undefined;
        if (marketType === 'spot') {
            response = await this.spotPublicGetPing (query);
            //
            //     {}
            //
            status = Object.keys (response).length ? this.json (response) : 'ok';
        } else if (marketType === 'swap') {
            response = await this.contractPublicGetPing (query);
            //
            //     {"success":true,"code":"0","data":"1648124374985"}
            //
            status = this.safeValue (response, 'success') ? 'ok' : this.json (response);
            updated = this.safeInteger (response, 'data');
        }
        return {
            'status': status,
            'updated': updated,
            'url': undefined,
            'eta': undefined,
            'info': response,
        };
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name mexc3#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {dict} params extra parameters specific to the mexc3 api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTime', undefined, params);
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.spotPublicGetTime (query);
            //
            //     {"serverTime": "1647519277579"}
            //
            return this.safeInteger (response, 'serverTime');
        } else if (marketType === 'swap') {
            response = await this.contractPublicGetPing (query);
            //
            //     {"success":true,"code":"0","data":"1648124374985"}
            //
            return this.safeInteger (response, 'data');
        }
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name mexc3#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {dict} params extra parameters specific to the mexc3 api endpoint
         * @returns {dict} an associative dictionary of currencies
         */
        const response = await this.spot2PublicGetMarketCoinList (params);
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "currency":"AGLD",
        //                 "coins":[
        //                     {
        //                         "chain":"ERC20",
        //                         "precision":18,
        //                         "fee":8.09,
        //                         "is_withdraw_enabled":true,
        //                         "is_deposit_enabled":true,
        //                         "deposit_min_confirm":16,
        //                         "withdraw_limit_max":500000.0,
        //                         "withdraw_limit_min":14.0
        //                     }
        //                 ],
        //                 "full_name":"Adventure Gold"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'full_name');
            let currencyActive = false;
            let currencyPrecision = undefined;
            let currencyFee = undefined;
            let currencyWithdrawMin = undefined;
            let currencyWithdrawMax = undefined;
            const networks = {};
            const chains = this.safeValue (currency, 'coins', []);
            let depositEnabled = false;
            let withdrawEnabled = false;
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chain');
                const network = this.safeNetwork (networkId);
                const isDepositEnabled = this.safeValue (chain, 'is_deposit_enabled', false);
                const isWithdrawEnabled = this.safeValue (chain, 'is_withdraw_enabled', false);
                const active = (isDepositEnabled && isWithdrawEnabled);
                currencyActive = active || currencyActive;
                const precisionDigits = this.safeString (chain, 'precision');
                const precision = this.parseNumber (this.parsePrecision (precisionDigits));
                const withdrawMin = this.safeString (chain, 'withdraw_limit_min');
                const withdrawMax = this.safeString (chain, 'withdraw_limit_max');
                currencyWithdrawMin = (currencyWithdrawMin === undefined) ? withdrawMin : currencyWithdrawMin;
                currencyWithdrawMax = (currencyWithdrawMax === undefined) ? withdrawMax : currencyWithdrawMax;
                if (Precise.stringGt (currencyWithdrawMin, withdrawMin)) {
                    currencyWithdrawMin = withdrawMin;
                }
                if (Precise.stringLt (currencyWithdrawMax, withdrawMax)) {
                    currencyWithdrawMax = withdrawMax;
                }
                if (isDepositEnabled) {
                    depositEnabled = true;
                }
                if (isWithdrawEnabled) {
                    withdrawEnabled = true;
                }
                networks[network] = {
                    'info': chain,
                    'id': networkId,
                    'network': network,
                    'active': active,
                    'deposit': isDepositEnabled,
                    'withdraw': isWithdrawEnabled,
                    'fee': this.safeNumber (chain, 'fee'),
                    'precision': precision,
                    'limits': {
                        'withdraw': {
                            'min': withdrawMin,
                            'max': withdrawMax,
                        },
                    },
                };
            }
            const networkKeys = Object.keys (networks);
            const networkKeysLength = networkKeys.length;
            if ((networkKeysLength === 1) || ('NONE' in networks)) {
                const defaultNetwork = this.safeValue2 (networks, 'NONE', networkKeysLength - 1);
                if (defaultNetwork !== undefined) {
                    currencyFee = defaultNetwork['fee'];
                    currencyPrecision = defaultNetwork['precision'];
                }
            }
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': currencyActive,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'fee': currencyFee,
                'precision': currencyPrecision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currencyWithdrawMin,
                        'max': currencyWithdrawMax,
                    },
                },
                'networks': networks,
            };
        }
        return result;
    }

    safeNetwork (networkId) {
        if (networkId.indexOf ('BSC') >= 0) {
            return 'BEP20';
        }
        const parts = networkId.split (' ');
        networkId = parts.join ('');
        networkId = networkId.replace ('-20', '20');
        const networksById = {
            'ETH': 'ETH',
            'ERC20': 'ERC20',
            'BEP20(BSC)': 'BEP20',
            'TRX': 'TRC20',
        };
        return this.safeString (networksById, networkId, networkId);
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name mexc3#fetchMarkets
         * @description retrieves data on all markets for mexc3
         * @param {dict} params extra parameters specific to the exchange api endpoint
         * @returns {[dict]} an array of objects representing market data
         */
        const spotMarket = await this.fetchSpotMarkets (params);
        const swapMarket = await this.fetchSwapMarkets (params);
        return this.arrayConcat (spotMarket, swapMarket);
    }

    async fetchSpotMarkets (params = {}) {
        const response = await this.spotPublicGetExchangeInfo (params);
        //
        //     {
        //         "timezone": "CST",
        //         "serverTime": 1647521860402,
        //         "rateLimits": [],
        //         "exchangeFilters": [],
        //         "symbols": [
        //           {
        //                "symbol": "OGNUSDT",
        //                "status": "ENABLED",
        //                "baseAsset": "OGN",
        //                "baseAssetPrecision": "2",
        //                "quoteAsset": "USDT",
        //                "quotePrecision": "4",
        //                "quoteAssetPrecision": "4",
        //                "baseCommissionPrecision": "2",
        //                "quoteCommissionPrecision": "4",
        //                "orderTypes": [
        //                    "LIMIT",
        //                    "LIMIT_MAKER"
        //                ],
        //                "quoteOrderQtyMarketAllowed": false,
        //                "isSpotTradingAllowed": true,
        //                "isMarginTradingAllowed": true,
        //                "permissions": [
        //                    "SPOT",
        //                    "MARGIN"
        //                ],
        //                "filters": [],
        //                "quoteAmountPrecision": "5",
        //                "baseSizePrecision": "0.01",
        //                "maxQuoteAmount": "5000000",
        //                "makerCommission": "0.002",
        //                "takerCommission": "0.002"
        //                // note, "icebergAllowed" & "ocoAllowed" fields were recently removed
        //            },
        //         ]
        //     }
        //
        // Notes:
        // - 'quotePrecision' seems deprecated, in favor of quoteAssetPrecision : https://dev.binance.vision/t/what-is-the-difference-between-quoteprecision-and-quoteassetprecision/4333
        // - 'baseSizePrecision' seems useless at this moment, because in orderbook, mexc might show base-size in i.e. 123.450, however, the tradable precision might be just 2 decimals after dot. So, we have to use baseAssetPrecision
        // - 'quoteAmountPrecision' , alike above field, seems useless, because markets which have value i.e. 5, and having 'quoteAssetPrecision':6, then the tradable amount still rounds up to 6 digits after dot.
        const data = this.safeValue (response, 'symbols', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const status = this.safeString (market, 'status');
            const makerCommission = this.safeNumber (market, 'makerCommission');
            const takerCommission = this.safeNumber (market, 'takerCommission');
            const maxQuoteAmount = this.safeNumber (market, 'maxQuoteAmount');
            const baseAssetPrecision = this.safeString (market, 'baseAssetPrecision');
            const quoteAssetPrecision = this.safeString (market, 'quoteAssetPrecision');
            const precisionBase = this.parseNumber (this.parsePrecision (baseAssetPrecision));
            const precisionQuote = this.parseNumber (this.parsePrecision (quoteAssetPrecision));
            const precisionPrice = precisionQuote;
            const precisionCost = precisionQuote;
            result.push ({
                'id': id,
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
                'active': (status === 'ENABLED'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': takerCommission,
                'maker': makerCommission,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': precisionBase,
                    'price': precisionPrice,
                    'cost': precisionCost,
                    // note, the below values are just precisions related to trading and is the actual blockchain precision of the individual currency. To view currency's individual precision, refer to fetchCurrencies()
                    // 'base': precisionBase,
                    // 'quote': precisionQuote,
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
                        'max': maxQuoteAmount,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchSwapMarkets (params = {}) {
        const response = await this.contractPublicGetDetail (params);
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"BTC_USDT",
        //                 "displayName":"BTC_USDT永续",
        //                 "displayNameEn":"BTC_USDT SWAP",
        //                 "positionOpenType":3,
        //                 "baseCoin":"BTC",
        //                 "quoteCoin":"USDT",
        //                 "settleCoin":"USDT",
        //                 "contractSize":0.0001,
        //                 "minLeverage":1,
        //                 "maxLeverage":125,
        //                 "priceScale":2,
        //                 "volScale":0,
        //                 "amountScale":4,
        //                 "priceUnit":0.5,
        //                 "volUnit":1,
        //                 "minVol":1,
        //                 "maxVol":1000000,
        //                 "bidLimitPriceRate":0.1,
        //                 "askLimitPriceRate":0.1,
        //                 "takerFeeRate":0.0006,
        //                 "makerFeeRate":0.0002,
        //                 "maintenanceMarginRate":0.004,
        //                 "initialMarginRate":0.008,
        //                 "riskBaseVol":10000,
        //                 "riskIncrVol":200000,
        //                 "riskIncrMmr":0.004,
        //                 "riskIncrImr":0.004,
        //                 "riskLevelLimit":5,
        //                 "priceCoefficientVariation":0.1,
        //                 "indexOrigin":["BINANCE","GATEIO","HUOBI","MXC"],
        //                 "state":0, // 0 enabled, 1 delivery, 2 completed, 3 offline, 4 pause
        //                 "isNew":false,
        //                 "isHot":true,
        //                 "isHidden":false
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseCoin');
            const quoteId = this.safeString (market, 'quoteCoin');
            const settleId = this.safeString (market, 'settleCoin');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const state = this.safeString (market, 'state');
            result.push ({
                'id': id,
                'symbol': base + '/' + quote + ':' + settle,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': 'swap',
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'active': (state === '0'),
                'contract': true,
                'linear': true,
                'inverse': false,
                'taker': this.safeNumber (market, 'takerFeeRate'),
                'maker': this.safeNumber (market, 'makerFeeRate'),
                'contractSize': this.safeNumber (market, 'contractSize'),
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'volUnit'),
                    'price': this.safeNumber (market, 'priceUnit'),
                },
                'limits': {
                    'leverage': {
                        'min': this.safeNumber (market, 'minLeverage'),
                        'max': this.safeNumber (market, 'maxLeverage'),
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minVol'),
                        'max': this.safeNumber (market, 'maxVol'),
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
                'info': market,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc3#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {str} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {dict} params extra parameters specific to the mexc3 api endpoint
         * @returns {dict} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let orderbook = undefined;
        if (market['spot']) {
            const response = await this.spotPublicGetDepth (this.extend (request, params));
            //
            //     {
            //         "lastUpdateId": "744267132",
            //         "bids": [
            //             ["40838.50","0.387864"],
            //             ["40837.95","0.008400"],
            //         ],
            //         "asks": [
            //             ["40838.61","6.544908"],
            //             ["40838.88","0.498000"],
            //         ]
            //     }
            //
            orderbook = this.parseOrderBook (response, symbol);
            orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
        } else if (market['swap']) {
            const response = await this.contractPublicGetDepthSymbol (this.extend (request, params));
            //
            //     {
            //         "success":true,
            //         "code":0,
            //         "data":{
            //             "asks":[
            //                 [3445.72,48379,1],
            //                 [3445.75,34994,1],
            //             ],
            //             "bids":[
            //                 [3445.55,44081,1],
            //                 [3445.51,24857,1],
            //             ],
            //             "version":2827730444,
            //             "timestamp":1634117846232
            //         }
            //     }
            //
            const data = this.safeValue (response, 'data');
            const timestamp = this.safeInteger (data, 'timestamp');
            orderbook = this.parseOrderBook (data, symbol, timestamp);
            orderbook['nonce'] = this.safeInteger (data, 'version');
        }
        return orderbook;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc3#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {str} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {dict} params extra parameters specific to the mexc3 api endpoint
         * @returns {[dict]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // if (since !== undefined) {
        //     request['startTime'] = since; bug in api, waiting for fix
        // }
        let trades = undefined;
        if (market['spot']) {
            let method = this.safeString (this.options, 'fetchTradesMethod', 'spotPublicGetAggTrades');
            method = this.safeString (params, 'method', method); // AggTrades, HistoricalTrades, Trades
            trades = await this[method] (this.extend (request, params));
            //
            //     /trades, /historicalTrades
            //
            //     [
            //         {
            //             "id": null,
            //             "price": "40798.94",
            //             "qty": "0.000508",
            //             "quoteQty": "20.72586152",
            //             "time": "1647546934374",
            //             "isBuyerMaker": true,
            //             "isBestMatch": true
            //         },
            //     ]
            //
            //     /aggrTrades
            //
            //     [
            //         {
            //           "a": null,
            //           "f": null,
            //           "l": null,
            //           "p": "40679",
            //           "q": "0.001309",
            //           "T": 1647551328000,
            //           "m": true,
            //           "M": true
            //         },
            //     ]
            //
        } else if (market['swap']) {
            const response = await this.contractPublicGetDealsSymbol (this.extend (request, params));
            //
            //     {
            //         "success": true,
            //         "code": 0,
            //         "data": [
            //             {
            //                 "p": 31199,
            //                 "v": 18,
            //                 "T": 1,
            //                 "O": 3,
            //                 "M": 2,
            //                 "t": 1609831235985
            //             },
            //         ]
            //     }
            //
            trades = this.safeValue (response, 'data');
        }
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let id = undefined;
        let timestamp = undefined;
        let orderId = undefined;
        let symbol = undefined;
        let fee = undefined;
        const type = undefined;
        let side = undefined;
        let takerOrMaker = undefined;
        let priceString = undefined;
        let amountString = undefined;
        let costString = undefined;
        // if swap
        if ('v' in trade) {
            //
            // swap: fetchTrades
            //
            //     {
            //         "p": 31199,
            //         "v": 18,
            //         "T": 1,
            //         "O": 3,
            //         "M": 2,
            //         "t": 1609831235985
            //     }
            //
            timestamp = this.safeInteger (trade, 't');
            market = this.safeMarket (undefined, market);
            symbol = market['symbol'];
            priceString = this.safeString (trade, 'p');
            amountString = this.safeString (trade, 'v');
            side = this.parseOrderSide (this.safeString (trade, 'T'));
            takerOrMaker = 'taker';
        } else {
            //
            // spot: fetchTrades (for aggTrades)
            //
            //         {
            //             "a": null,
            //             "f": null,
            //             "l": null,
            //             "p": "40679",
            //             "q": "0.001309",
            //             "T": 1647551328000,
            //             "m": true,
            //             "M": true
            //         }
            //
            // spot: fetchMyTrades, fetchOrderTrades
            //
            //         {
            //             "symbol": "BTCUSDT",
            //             "id": "133948532984922113",
            //             "orderId": "133948532531949568",
            //             "orderListId": "-1",
            //             "price": "41995.51",
            //             "qty": "0.0002",
            //             "quoteQty": "8.399102",
            //             "commission": "0.016798204",
            //             "commissionAsset": "USDT",
            //             "time": "1647718055000",
            //             "isBuyer": true,
            //             "isMaker": false,
            //             "isBestMatch": true
            //         }
            //
            // swap: fetchMyTrades, fetchOrderTrades
            //
            //         {
            //             "id": "299444585",
            //             "symbol": "STEPN_USDT",
            //             "side": "1",
            //             "vol": "1",
            //             "price": "2.45455",
            //             "feeCurrency": "USDT",
            //             "fee": "0.00147273",
            //             "timestamp": "1648924557000",
            //             "profit": "0",
            //             "category": "1",
            //             "orderId": "265307163526610432",
            //             "positionMode": "1",
            //             "taker": true
            //         }
            //
            const marketId = this.safeString (trade, 'symbol');
            market = this.safeMarket (marketId, market);
            symbol = market['symbol'];
            id = this.safeString2 (trade, 'id', 'a');
            priceString = this.safeString2 (trade, 'price', 'p');
            orderId = this.safeString (trade, 'orderId');
            // if swap
            if ('positionMode' in trade) {
                timestamp = this.safeInteger (trade, 'timestamp');
                amountString = this.safeString (trade, 'vol');
                side = this.parseOrderSide (this.safeString (trade, 'side'));
                fee = {
                    'cost': this.safeNumber (trade, 'fee'),
                    'currency': this.safeCurrencyCode (this.safeString (trade, 'feeCurrency')),
                };
                takerOrMaker = this.safeValue (trade, 'taker') ? 'taker' : 'maker';
            } else {
                timestamp = this.safeInteger2 (trade, 'time', 'T');
                amountString = this.safeString2 (trade, 'qty', 'q');
                costString = this.safeString (trade, 'quoteQty');
                const isBuyer = this.safeValue (trade, 'isBuyer');
                const isMaker = this.safeValue (trade, 'isMaker');
                const buyerMaker = this.safeString2 (trade, 'isBuyerMaker', 'm');
                if (isMaker !== undefined) {
                    takerOrMaker = isMaker ? 'maker' : 'taker';
                }
                if (isBuyer !== undefined) {
                    side = isBuyer ? 'buy' : 'sell';
                }
                if (buyerMaker !== undefined) {
                    side = buyerMaker ? 'sell' : 'buy';
                    takerOrMaker = 'taker';
                }
                const feeAsset = this.safeString (trade, 'commissionAsset');
                if (feeAsset !== undefined) {
                    fee = {
                        'cost': this.safeNumber (trade, 'commission'),
                        'currency': this.safeCurrencyCode (feeAsset),
                    };
                }
            }
        }
        if (id === undefined) {
            id = this.syntheticTradeId (market, timestamp, side, amountString, priceString, type, takerOrMaker);
        }
        return this.safeTrade ({
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
            'info': trade,
        }, market);
    }

    syntheticTradeId (market = undefined, timestamp = undefined, side = undefined, amount = undefined, price = undefined, orderType = undefined, takerOrMaker = undefined) {
        // TODO: can be unified method? this approach is being used by multiple exchanges (mexc, woo-coinsbit, dydx, ...)
        let id = '';
        if (timestamp !== undefined) {
            id = this.numberToString (timestamp) + '-' + this.safeString (market, 'id', '_');
            if (side !== undefined) {
                id += '-' + side;
            }
            if (amount !== undefined) {
                id += '-' + this.numberToString (amount);
            }
            if (price !== undefined) {
                id += '-' + this.numberToString (price);
            }
            if (takerOrMaker !== undefined) {
                id += '-' + takerOrMaker;
            }
            if (orderType !== undefined) {
                id += '-' + orderType;
            }
        }
        return id;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc3#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {str} symbol unified symbol of the market to fetch OHLCV data for
         * @param {str} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {dict} params extra parameters specific to the mexc3 api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const options = this.safeValue (this.options, 'timeframes', {});
        const timeframes = this.safeValue (options, market['type'], {});
        const timeframeValue = this.safeString (timeframes, timeframe);
        const request = {
            'symbol': market['id'],
            'interval': timeframeValue,
        };
        let candles = undefined;
        if (market['spot']) {
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            const response = await this.spotPublicGetKlines (this.extend (request, params));
            //
            //     [
            //       [
            //         1640804880000,
            //         "47482.36",
            //         "47482.36",
            //         "47416.57",
            //         "47436.1",
            //         "3.550717",
            //         1640804940000,
            //         "168387.3"
            //       ],
            //     ]
            //
            candles = response;
        } else if (market['swap']) {
            if (since !== undefined) {
                request['start'] = parseInt (since / 1000);
            }
            const priceType = this.safeString (params, 'price', 'default');
            params = this.omit (params, 'price');
            const method = this.getSupportedMapping (priceType, {
                'default': 'contractPublicGetKlineSymbol',
                'index': 'contractPublicGetKlineIndexPriceSymbol',
                'mark': 'contractPublicGetKlineFairPriceSymbol',
            });
            const response = await this[method] (this.extend (request, params));
            //
            //     {
            //         "success":true,
            //         "code":0,
            //         "data":{
            //             "time":[1634052300,1634052360,1634052420],
            //             "open":[3492.2,3491.3,3495.65],
            //             "close":[3491.3,3495.65,3495.2],
            //             "high":[3495.85,3496.55,3499.4],
            //             "low":[3491.15,3490.9,3494.2],
            //             "vol":[1740.0,351.0,314.0],
            //             "amount":[60793.623,12260.4885,10983.1375],
            //         }
            //     }
            //
            const data = this.safeValue (response, 'data');
            candles = this.convertTradingViewToOHLCV (data, 'time', 'open', 'high', 'low', 'close', 'vol');
        }
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name mexc3#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[str]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {dict} params extra parameters specific to the mexc3 api endpoint
         * @returns {dict} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        let isSingularMarket = false;
        if (symbols !== undefined) {
            const length = symbols.length;
            isSingularMarket = length === 1;
            const firstSymbol = this.safeString (symbols, 0);
            market = this.market (firstSymbol);
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        let tickers = undefined;
        if (isSingularMarket) {
            request['symbol'] = market['id'];
        }
        if (marketType === 'spot') {
            tickers = await this.spotPublicGetTicker24hr (this.extend (request, query));
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "priceChange": "184.34",
            //             "priceChangePercent": "0.00400048",
            //             "prevClosePrice": "46079.37",
            //             "lastPrice": "46263.71",
            //             "lastQty": "",
            //             "bidPrice": "46260.38",
            //             "bidQty": "",
            //             "askPrice": "46260.41",
            //             "askQty": "",
            //             "openPrice": "46079.37",
            //             "highPrice": "47550.01",
            //             "lowPrice": "45555.5",
            //             "volume": "1732.461487",
            //             "quoteVolume": null,
            //             "openTime": 1641349500000,
            //             "closeTime": 1641349582808,
            //             "count": null
            //         }
            //     ]
            //
        } else if (marketType === 'swap') {
            const response = await this.contractPublicGetTicker (this.extend (request, query));
            //
            //     {
            //         "success":true,
            //         "code":0,
            //         "data":[
            //             {
            //                 "symbol":"ETH_USDT",
            //                 "lastPrice":3581.3,
            //                 "bid1":3581.25,
            //                 "ask1":3581.5,
            //                 "volume24":4045530,
            //                 "amount24":141331823.5755,
            //                 "holdVol":5832946,
            //                 "lower24Price":3413.4,
            //                 "high24Price":3588.7,
            //                 "riseFallRate":0.0275,
            //                 "riseFallValue":95.95,
            //                 "indexPrice":3580.7852,
            //                 "fairPrice":3581.08,
            //                 "fundingRate":0.000063,
            //                 "maxBidPrice":3938.85,
            //                 "minAskPrice":3222.7,
            //                 "timestamp":1634162885016
            //             },
            //         ]
            //     }
            //
            tickers = this.safeValue (response, 'data', []);
        }
        // when it's single symbol request, the returned structure is different (singular object) for both spot & swap, thus we need to wrap inside array
        if (isSingularMarket) {
            tickers = [ tickers ];
        }
        return this.parseTickers (tickers, symbols);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name mexc3#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {str} symbol unified symbol of the market to fetch the ticker for
         * @param {dict} params extra parameters specific to the mexc3 api endpoint
         * @returns {dict} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTicker', market, params);
        let ticker = undefined;
        const request = {
            'symbol': market['id'],
        };
        if (marketType === 'spot') {
            ticker = await this.spotPublicGetTicker24hr (this.extend (request, query));
            //
            //     {
            //         "symbol": "BTCUSDT",
            //         "priceChange": "184.34",
            //         "priceChangePercent": "0.00400048",
            //         "prevClosePrice": "46079.37",
            //         "lastPrice": "46263.71",
            //         "lastQty": "",
            //         "bidPrice": "46260.38",
            //         "bidQty": "",
            //         "askPrice": "46260.41",
            //         "askQty": "",
            //         "openPrice": "46079.37",
            //         "highPrice": "47550.01",
            //         "lowPrice": "45555.5",
            //         "volume": "1732.461487",
            //         "quoteVolume": null,
            //         "openTime": 1641349500000,
            //         "closeTime": 1641349582808,
            //         "count": null
            //     }
            //
        } else if (marketType === 'swap') {
            const response = await this.contractPublicGetTicker (this.extend (request, query));
            //
            //     {
            //         "success":true,
            //         "code":0,
            //         "data":{
            //             "symbol":"ETH_USDT",
            //             "lastPrice":3581.3,
            //             "bid1":3581.25,
            //             "ask1":3581.5,
            //             "volume24":4045530,
            //             "amount24":141331823.5755,
            //             "holdVol":5832946,
            //             "lower24Price":3413.4,
            //             "high24Price":3588.7,
            //             "riseFallRate":0.0275,
            //             "riseFallValue":95.95,
            //             "indexPrice":3580.7852,
            //             "fairPrice":3581.08,
            //             "fundingRate":0.000063,
            //             "maxBidPrice":3938.85,
            //             "minAskPrice":3222.7,
            //             "timestamp":1634162885016
            //         }
            //     }
            //
            ticker = this.safeValue (response, 'data', {});
        }
        // when it's single symbol request, the returned structure is different (singular object) for both spot & swap, thus we need to wrap inside array
        return this.parseTicker (ticker, symbol);
    }

    parseTicker (ticker, market = undefined) {
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        let timestamp = undefined;
        let bid = undefined;
        let ask = undefined;
        let bidVolume = undefined;
        let askVolume = undefined;
        let baseVolume = undefined;
        let quoteVolume = undefined;
        let open = undefined;
        let high = undefined;
        let low = undefined;
        let changePcnt = undefined;
        let changeValue = undefined;
        let prevClose = undefined;
        const isSwap = this.safeValue (market, 'swap');
        // if swap
        if (isSwap || ('timestamp' in ticker)) {
            //
            //     {
            //         "symbol":"ETH_USDT",
            //         "lastPrice":3581.3,
            //         "bid1":3581.25,
            //         "ask1":3581.5,
            //         "volume24":4045530,
            //         "amount24":141331823.5755,
            //         "holdVol":5832946,
            //         "lower24Price":3413.4,
            //         "high24Price":3588.7,
            //         "riseFallRate":0.0275,
            //         "riseFallValue":95.95,
            //         "indexPrice":3580.7852,
            //         "fairPrice":3581.08,
            //         "fundingRate":0.000063,
            //         "maxBidPrice":3938.85,
            //         "minAskPrice":3222.7,
            //         "timestamp":1634162885016
            //     }
            //
            timestamp = this.safeInteger (ticker, 'timestamp');
            bid = this.safeNumber (ticker, 'bid1');
            ask = this.safeNumber (ticker, 'ask1');
            baseVolume = this.safeString (ticker, 'volume24');
            quoteVolume = this.safeString (ticker, 'amount24');
            high = this.safeNumber (ticker, 'high24Price');
            low = this.safeNumber (ticker, 'lower24Price');
            changeValue = this.safeString (ticker, 'riseFallValue');
            changePcnt = this.safeString (ticker, 'riseFallRate');
            changePcnt = this.parseNumber (Precise.stringMul (changePcnt, '100'));
        } else {
            //
            //     {
            //         "symbol": "BTCUSDT",
            //         "priceChange": "184.34",
            //         "priceChangePercent": "0.00400048",
            //         "prevClosePrice": "46079.37",
            //         "lastPrice": "46263.71",
            //         "lastQty": "",
            //         "bidPrice": "46260.38",
            //         "bidQty": "",
            //         "askPrice": "46260.41",
            //         "askQty": "",
            //         "openPrice": "46079.37",
            //         "highPrice": "47550.01",
            //         "lowPrice": "45555.5",
            //         "volume": "1732.461487",
            //         "quoteVolume": null,
            //         "openTime": 1641349500000,
            //         "closeTime": 1641349582808,
            //         "count": null
            //     }
            //
            timestamp = this.safeInteger (ticker, 'closeTime');
            bid = this.safeNumber (ticker, 'bidPrice');
            ask = this.safeNumber (ticker, 'askPrice');
            bidVolume = this.safeNumber (ticker, 'bidQty');
            askVolume = this.safeNumber (ticker, 'askQty');
            if (bidVolume === 0) {
                bidVolume = undefined;
            }
            if (askVolume === 0) {
                askVolume = undefined;
            }
            baseVolume = this.safeString (ticker, 'volume');
            quoteVolume = this.safeString (ticker, 'quoteVolume');
            open = this.safeString (ticker, 'openPrice');
            high = this.safeNumber (ticker, 'highPrice');
            low = this.safeNumber (ticker, 'lowPrice');
            prevClose = this.safeString (ticker, 'prevClosePrice');
            changeValue = this.safeString (ticker, 'priceChange');
            changePcnt = this.safeString (ticker, 'priceChangePercent');
            changePcnt = this.parseNumber (Precise.stringMul (changePcnt, '100'));
        }
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'open': open,
            'high': high,
            'low': low,
            'close': this.safeString (ticker, 'lastPrice'),
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': undefined,
            'previousClose': prevClose,
            'change': changeValue,
            'percentage': changePcnt,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchBidsAsks (symbols = undefined, params = {}) {
        /**
         * @method
         * @name mexc3#fetchBidsAsks
         * @description fetches the bid and ask price and volume for multiple markets
         * @param {[str]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
         * @param {dict} params extra parameters specific to the mexc3 api endpoint
         * @returns {dict} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        let isSingularMarket = false;
        if (symbols !== undefined) {
            const length = symbols.length;
            isSingularMarket = length === 1;
            market = this.market (symbols[0]);
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchBidsAsks', market, params);
        let tickers = undefined;
        if (marketType === 'spot') {
            tickers = await this.spotPublicGetTickerBookTicker (query);
            //
            //     [
            //       {
            //         "symbol": "AEUSDT",
            //         "bidPrice": "0.11001",
            //         "bidQty": "115.59",
            //         "askPrice": "0.11127",
            //         "askQty": "215.48"
            //       },
            //     ]
            //
        } else if (marketType === 'swap') {
            throw new NotSupported (this.id + ' fetchBidsAsks() is not available for ' + marketType + ' markets');
        }
        // when it's single symbol request, the returned structure is different (singular object) for both spot & swap, thus we need to wrap inside array
        if (isSingularMarket) {
            tickers = [ tickers ];
        }
        return this.parseTickers (tickers, symbols);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            return await this.createSpotOrder (market, type, side, amount, price, params);
        } else if (market['swap']) {
            return await this.createSwapOrder (market, type, side, amount, price, params);
        }
    }

    async createSpotOrder (market, type, side, amount, price = undefined, params = {}) {
        const symbol = market['symbol'];
        const orderSide = (side === 'buy') ? 'BUY' : 'SELL';
        const request = {
            'symbol': market['id'],
            'side': orderSide,
            'type': type.toUpperCase (),
        };
        if (orderSide === 'BUY' && type === 'market') {
            const quoteOrderQty = this.safeNumber (params, 'quoteOrderQty');
            if (quoteOrderQty !== undefined) {
                amount = quoteOrderQty;
            } else if (this.options['createMarketBuyOrderRequiresPrice']) {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                } else {
                    amount = amount * price;
                }
            }
            request['quoteOrderQty'] = amount;
        } else {
            request['quantity'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['newClientOrderId'] = clientOrderId;
            params = this.omit (params, [ 'type', 'clientOrderId' ]);
        }
        const response = await this.spotPrivatePostOrder (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "123738410679123456",
        //         "orderListId": -1
        //     }
        //
        return this.extend (this.parseOrder (response, market), {
            'side': side,
            'type': type,
            'price': price,
            'amount': amount,
        });
    }

    async createSwapOrder (market, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const symbol = market['symbol'];
        const unavailableContracts = this.safeValue (this.options, 'unavailableContracts', {});
        const isContractUnavaiable = this.safeValue (unavailableContracts, symbol, false);
        if (isContractUnavaiable) {
            throw new NotSupported (this.id + ' createSwapOrder() does not support yet this symbol:' + symbol);
        }
        let openType = undefined;
        const marginType = this.safeStringLower (params, 'margin');
        if (marginType !== undefined) {
            if (marginType === 'cross') {
                openType = 2;
            } else if (marginType === 'isolated') {
                openType = 1;
            } else {
                throw new ArgumentsRequired (this.id + ' createSwapOrder() margin parameter should be either "cross" or "isolated"');
            }
        } else {
            openType = this.safeInteger (params, 'openType', 2); // defaulting to cross margin
        }
        if ((type !== 'limit') && (type !== 'market') && (type !== 1) && (type !== 2) && (type !== 3) && (type !== 4) && (type !== 5) && (type !== 6)) {
            throw new InvalidOrder (this.id + ' createSwapOrder() order type must either limit, market, or 1 for limit orders, 2 for post-only orders, 3 for IOC orders, 4 for FOK orders, 5 for market orders or 6 to convert market price to current price');
        }
        const postOnly = this.safeValue (params, 'postOnly', false);
        if (postOnly) {
            type = 2;
        } else if (type === 'limit') {
            type = 1;
        } else if (type === 'market') {
            type = 6;
        }
        // TODO: side not unified
        if ((side !== 1) && (side !== 2) && (side !== 3) && (side !== 4)) {
            throw new InvalidOrder (this.id + ' createSwapOrder() order side must be 1 open long, 2 close short, 3 open short or 4 close long');
        }
        const request = {
            'symbol': market['id'],
            // 'price': parseFloat (this.priceToPrecision (symbol, price)),
            'vol': parseFloat (this.amountToPrecision (symbol, amount)),
            // 'leverage': int, // required for isolated margin
            'side': side, // 1 open long, 2 close short, 3 open short, 4 close long
            //
            // supported order types
            //
            //     1 limit
            //     2 post only maker (PO)
            //     3 transact or cancel instantly (IOC)
            //     4 transact completely or cancel completely (FOK)
            //     5 market orders
            //     6 convert market price to current price
            //
            'type': type,
            'openType': openType, // 1 isolated, 2 cross
            // 'positionId': 1394650, // long, filling in this parameter when closing a position is recommended
            // 'externalOid': clientOrderId,
            // 'triggerPrice': 10.0, // Required for trigger order
            // 'triggerType': 1, // Required for trigger order 1: more than or equal, 2: less than or equal
            // 'executeCycle': 1, // Required for trigger order 1: 24 hours,2: 7 days
            // 'trend': 1, // Required for trigger order 1: latest price, 2: fair price, 3: index price
            // 'orderType': 1, // Required for trigger order 1: limit order,2:Post Only Maker,3: close or cancel instantly ,4: close or cancel completely,5: Market order
        };
        let method = 'contractPrivatePostOrderSubmit';
        const stopPrice = this.safeNumber2 (params, 'triggerPrice', 'stopPrice');
        params = this.omit (params, [ 'stopPrice', 'triggerPrice' ]);
        if (stopPrice) {
            method = 'contractPrivatePostPlanorderPlace';
            request['triggerPrice'] = this.priceToPrecision (symbol, stopPrice);
            request['triggerType'] = this.safeInteger (params, 'triggerType', 1);
            request['executeCycle'] = this.safeInteger (params, 'executeCycle', 1);
            request['trend'] = this.safeInteger (params, 'trend', 1);
            request['orderType'] = this.safeInteger (params, 'orderType', 1);
        }
        if ((type !== 5) && (type !== 6) && (type !== 'market')) {
            request['price'] = parseFloat (this.priceToPrecision (symbol, price));
        }
        if (openType === 1) {
            const leverage = this.safeInteger (params, 'leverage');
            if (leverage === undefined) {
                throw new ArgumentsRequired (this.id + ' createSwapOrder() requires a leverage parameter for isolated margin orders');
            }
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'externalOid');
        if (clientOrderId !== undefined) {
            request['externalOid'] = clientOrderId;
        }
        params = this.omit (params, [ 'clientOrderId', 'externalOid', 'postOnly' ]);
        const response = await this[method] (this.extend (request, params));
        //
        // Swap
        //     {"code":200,"data":"2ff3163e8617443cb9c6fc19d42b1ca4"}
        //
        // Trigger
        //     {"success":true,"code":0,"data":259208506303929856}
        //
        const data = this.safeString (response, 'data');
        return this.parseOrder (data, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let data = undefined;
        if (market['spot']) {
            const clientOrderId = this.safeString (params, 'clientOrderId');
            if (clientOrderId !== undefined) {
                params = this.omit (params, 'clientOrderId');
                request['origClientOrderId'] = clientOrderId;
            } else {
                request['orderId'] = id;
            }
            data = await this.spotPrivateGetOrder (this.extend (request, params));
            //
            //     {
            //         "symbol": "BTCUSDT",
            //         "orderId": "133734823834147272",
            //         "orderListId": "-1",
            //         "clientOrderId": null,
            //         "price": "30000",
            //         "origQty": "0.0002",
            //         "executedQty": "0",
            //         "cummulativeQuoteQty": "0",
            //         "status": "CANCELED",
            //         "timeInForce": null,
            //         "type": "LIMIT",
            //         "side": "BUY",
            //         "stopPrice": null,
            //         "icebergQty": null,
            //         "time": "1647667102000",
            //         "updateTime": "1647708567000",
            //         "isWorking": true,
            //         "origQuoteOrderQty": "6"
            //     }
            //
        } else if (market['swap']) {
            request['order_id'] = id;
            const response = await this.contractPrivateGetOrderGetOrderId (this.extend (request, params));
            //
            //     {
            //         "success": true,
            //         "code": "0",
            //         "data": {
            //             "orderId": "264995729269765120",
            //             "symbol": "STEPN_USDT",
            //             "positionId": "0",
            //             "price": "2.2",
            //             "vol": "15",
            //             "leverage": "20",
            //             "side": "1",
            //             "category": "1",
            //             "orderType": "1",
            //             "dealAvgPrice": "0",
            //             "dealVol": "0",
            //             "orderMargin": "2.2528",
            //             "takerFee": "0",
            //             "makerFee": "0",
            //             "profit": "0",
            //             "feeCurrency": "USDT",
            //             "openType": "1",
            //             "state": "2",
            //             "externalOid": "_m_0e9520c256744d64b942985189026d20",
            //             "errorCode": "0",
            //             "usedMargin": "0",
            //             "createTime": "1648850305236",
            //             "updateTime": "1648850305245",
            //             "positionMode": "1"
            //         }
            //     }
            //
            data = this.safeValue (response, 'data');
        }
        return this.parseOrder (data, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrders', market, params);
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument for spot market');
            }
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            const response = await this.spotPrivateGetAllOrders (this.extend (request, query));
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "orderId": "133949373632483328",
            //             "orderListId": "-1",
            //             "clientOrderId": null,
            //             "price": "45000",
            //             "origQty": "0.0002",
            //             "executedQty": "0",
            //             "cummulativeQuoteQty": "0",
            //             "status": "NEW",
            //             "timeInForce": null,
            //             "type": "LIMIT",
            //             "side": "SELL",
            //             "stopPrice": null,
            //             "icebergQty": null,
            //             "time": "1647718255000",
            //             "updateTime": "1647718255000",
            //             "isWorking": true,
            //             "origQuoteOrderQty": "9"
            //         },
            //     ]
            //
            return this.parseOrders (response, market, since, limit);
        } else {
            if (since !== undefined) {
                request['start_time'] = since;
                const end = this.safeInteger (params, 'end_time');
                if (end === undefined) {
                    request['end_time'] = this.sum (since, this.options['maxTimeTillEnd']);
                }
            }
            if (limit !== undefined) {
                request['page_size'] = limit;
            }
            let method = this.safeString (this.options, 'cancelOrder', 'contractPrivateGetOrderListHistoryOrders'); // contractPrivatePostOrderCancel, contractPrivatePostPlanorderCancel
            method = this.safeString (query, 'method', method);
            let ordersOfRegular = [];
            let ordersOfTrigger = [];
            if (method === 'contractPrivateGetOrderListHistoryOrders') {
                const response = await this.contractPrivateGetOrderListHistoryOrders (this.extend (request, query));
                //
                //     {
                //         "success": true,
                //         "code": "0",
                //         "data": [
                //             {
                //                 "orderId": "265230764677709315",
                //                 "symbol": "STEPN_USDT",
                //                 "positionId": "0",
                //                 "price": "2.1",
                //                 "vol": "102",
                //                 "leverage": "20",
                //                 "side": "1",
                //                 "category": "1",
                //                 "orderType": "1",
                //                 "dealAvgPrice": "0",
                //                 "dealVol": "0",
                //                 "orderMargin": "10.96704",
                //                 "takerFee": "0",
                //                 "makerFee": "0",
                //                 "profit": "0",
                //                 "feeCurrency": "USDT",
                //                 "openType": "1",
                //                 "state": "2",
                //                 "externalOid": "_m_7e42f8df6b324c869e4e200397e2b00f",
                //                 "errorCode": "0",
                //                 "usedMargin": "0",
                //                 "createTime": "1648906342000",
                //                 "updateTime": "1648906342000",
                //                 "positionMode": "1"
                //             },
                //          ]
                //     }
                //
                ordersOfRegular = this.safeValue (response, 'data');
            } else {
                // the Planorder endpoints work not only for stop-market orders, but also for stop-limit orders that were supposed to have a separate endpoint
                const response = await this.contractPrivateGetPlanorderListOrders (this.extend (request, query));
                //
                //     {
                //         "success": true,
                //         "code": "0",
                //         "data": [
                //             {
                //                 "symbol": "STEPN_USDT",
                //                 "leverage": "20",
                //                 "side": "1",
                //                 "vol": "13",
                //                 "openType": "1",
                //                 "state": "1",
                //                 "orderType": "1",
                //                 "errorCode": "0",
                //                 "createTime": "1648984276000",
                //                 "updateTime": "1648984276000",
                //                 "id": "265557643326564352",
                //                 "triggerType": "1",
                //                 "triggerPrice": "3",
                //                 "price": "2.9", // not present in stop-market, but in stop-limit order
                //                 "executeCycle": "87600",
                //                 "trend": "1",
                //             },
                //         ]
                //     }
                //
                ordersOfTrigger = this.safeValue (response, 'data');
            }
            const merged = this.arrayConcat (ordersOfTrigger, ordersOfRegular);
            return this.parseOrders (merged, market, since, limit, params);
        }
    }

    async fetchOrdersByIds (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrdersByIds', market, params);
        if (marketType === 'spot') {
            throw new BadRequest (this.id + ' fetchOrdersByIds() is not supported for ' + marketType);
        } else {
            request['order_ids'] = ids.join (',');
            const response = await this.contractPrivateGetOrderBatchQuery (this.extend (request, query));
            //
            //     {
            //         "success": true,
            //         "code": "0",
            //         "data": [
            //             {
            //                 "orderId": "265230764677709315",
            //                 "symbol": "STEPN_USDT",
            //                 "positionId": "0",
            //                 "price": "2.1",
            //                 "vol": "102",
            //                 "leverage": "20",
            //                 "side": "1",
            //                 "category": "1",
            //                 "orderType": "1",
            //                 "dealAvgPrice": "0",
            //                 "dealVol": "0",
            //                 "orderMargin": "10.96704",
            //                 "takerFee": "0",
            //                 "makerFee": "0",
            //                 "profit": "0",
            //                 "feeCurrency": "USDT",
            //                 "openType": "1",
            //                 "state": "2",
            //                 "externalOid": "_m_7e42f8df6b324c869e4e200397e2b00f",
            //                 "errorCode": "0",
            //                 "usedMargin": "0",
            //                 "createTime": "1648906342000",
            //                 "updateTime": "1648906342000",
            //                 "positionMode": "1"
            //             }
            //         ]
            //     }
            //
            const data = this.safeValue (response, 'data');
            return this.parseOrders (data, market);
        }
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument for spot market');
            }
            const response = await this.spotPrivateGetOpenOrders (this.extend (request, query));
            //
            // spot
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "orderId": "133949373632483328",
            //             "orderListId": "-1",
            //             "clientOrderId": "",
            //             "price": "45000",
            //             "origQty": "0.0002",
            //             "executedQty": "0",
            //             "cummulativeQuoteQty": "0",
            //             "status": "NEW",
            //             "timeInForce": null,
            //             "type": "LIMIT",
            //             "side": "SELL",
            //             "stopPrice": null,
            //             "icebergQty": null,
            //             "time": "1647718255199",
            //             "updateTime": null,
            //             "isWorking": true,
            //             "origQuoteOrderQty": "9"
            //         }
            //     ]
            //
            return this.parseOrders (response, market, since, limit);
        } else {
            // TO_DO: another possible way is through: open_orders/{symbol}, but as they have same ratelimits, and less granularity, i think historical orders are more convenient, as it supports more params (however, theoretically, open-orders endpoint might be sligthly fast)
            return await this.fetchOrdersByState (2, symbol, since, limit, params);
        }
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState (3, symbol, since, limit, params);
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState (4, symbol, since, limit, params);
    }

    async fetchOrdersByState (state, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const [ marketType ] = this.handleMarketTypeAndParams ('fetchOrdersByState', market, params);
        if (marketType === 'spot') {
            throw new BadRequest (this.id + ' fetchOrdersByState() is not supported for ' + marketType);
        } else {
            params['states'] = state;
            return this.fetchOrders (symbol, since, limit, params);
        }
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        let data = undefined;
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
            }
            const request = {
                'symbol': market['id'],
            };
            const clientOrderId = this.safeString (params, 'clientOrderId');
            if (clientOrderId !== undefined) {
                params = this.omit (query, 'clientOrderId');
                request['origClientOrderId'] = clientOrderId;
            } else {
                request['orderId'] = id;
            }
            data = await this.spotPrivateDeleteOrder (this.extend (request, params));
            //
            //     {
            //         "symbol": "BTCUSDT",
            //         "orderId": "133734823834447872",
            //         "price": "30000",
            //         "origQty": "0.0002",
            //         "type": "LIMIT",
            //         "side": "BUY"
            //     }
            //
        } else {
            // TODO: PlanorderCancel endpoint has bug atm. waiting for fix.
            let method = this.safeString (this.options, 'cancelOrder', 'contractPrivatePostOrderCancel'); // contractPrivatePostOrderCancel, contractPrivatePostPlanorderCancel
            method = this.safeString (query, 'method', method);
            const response = await this[method] ([ id ]); // the request cannot be changed or extended. This is the only way to send.
            //
            //     {
            //         "success": true,
            //         "code": "0",
            //         "data": [
            //             {
            //                 "orderId": "264995729269765120",
            //                 "errorCode": "0",         // if already canceled: "2041"; if doesn't exist: "2040"
            //                 "errorMsg": "success",    // if already canceled: "order state cannot be cancelled"; if doesn't exist: "order not exist"
            //             }
            //         ]
            //     }
            //
            data = this.safeValue (response, 'data');
            const order = this.safeValue (data, 0);
            const errorMsg = this.safeValue (order, 'errorMsg', '');
            if (errorMsg !== 'success') {
                throw new InvalidOrder (this.id + ' cancelOrder() the order with id ' + id + ' cannot be cancelled: ' + errorMsg);
            }
        }
        return this.parseOrder (data, market);
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = symbol !== undefined ? this.market (symbol) : undefined;
        const [ marketType ] = this.handleMarketTypeAndParams ('cancelOrders', market, params);
        if (marketType === 'spot') {
            throw new BadRequest (this.id + ' cancelOrders() is not supported for ' + marketType);
        } else {
            const response = await this.contractPrivatePostOrderCancel (ids); // the request cannot be changed or extended. The only way to send.
            //
            //     {
            //         "success": true,
            //         "code": "0",
            //         "data": [
            //             {
            //                 "orderId": "264995729269765120",
            //                 "errorCode": "0",         // if already canceled: "2041"
            //                 "errorMsg": "success",    // if already canceled: "order state cannot be cancelled"
            //             },
            //         ]
            //     }
            //
            const data = this.safeValue (response, 'data');
            return this.parseOrders (data, market);
        }
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = symbol !== undefined ? this.market (symbol) : undefined;
        const request = {};
        const [ marketType, query ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params);
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument on spot');
            }
            request['symbol'] = market['id'];
            const response = await this.spotPrivateDeleteOpenOrders (this.extend (request, query));
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "orderId": "133926492139692032",
            //             "price": "30000",
            //             "origQty": "0.0002",
            //             "type": "LIMIT",
            //             "side": "BUY"
            //         },
            //     ]
            //
            return this.parseOrders (response, market);
        } else {
            if (symbol !== undefined) {
                request['symbol'] = market['id'];
            }
            // method can be either: contractPrivatePostOrderCancelAll or contractPrivatePostPlanorderCancelAll
            // the Planorder endpoints work not only for stop-market orders but also for stop-limit orders that are supposed to have separate endpoint
            let method = this.safeString (this.options, 'cancelAllOrders', 'contractPrivatePostOrderCancelAll');
            method = this.safeString (query, 'method', method);
            const response = await this[method] (this.extend (request, query));
            //
            //     {
            //         "success": true,
            //         "code": "0"
            //     }
            //
            const data = this.safeValue (response, 'data', []);
            return this.parseOrders (data, market);
        }
    }

    parseOrder (order, market = undefined) {
        //
        // spot: createOrder
        //
        //     { "symbol": "BTCUSDT", "orderId": "123738410679123456", "orderListId": -1 }
        //
        // spot: cancelOrder, cancelAllOrders
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "133926441921286144",
        //         "price": "30000",
        //         "origQty": "0.0002",
        //         "type": "LIMIT",
        //         "side": "BUY"
        //     }
        //
        // spot: fetchOrder, fetchOpenOrders, fetchOrders
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "133734823834147272",
        //         "orderListId": "-1",
        //         "clientOrderId": null,
        //         "price": "30000",
        //         "origQty": "0.0002",
        //         "executedQty": "0",
        //         "cummulativeQuoteQty": "0",
        //         "status": "CANCELED",
        //         "timeInForce": null,
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "stopPrice": null,
        //         "icebergQty": null,
        //         "time": "1647667102000",
        //         "updateTime": "1647708567000",
        //         "isWorking": true,
        //         "origQuoteOrderQty": "6"
        //     }
        //
        // swap: createOrder
        //
        //     2ff3163e8617443cb9c6fc19d42b1ca4
        //
        // swap: fetchOrder, fetchOrders
        //
        //     regular
        //     {
        //         "orderId": "264995729269765120",
        //         "symbol": "STEPN_USDT",
        //         "positionId": "0",
        //         "price": "2.2",
        //         "vol": "15",
        //         "leverage": "20",
        //         "side": "1", // TODO: not unified
        //         "category": "1",
        //         "orderType": "1", // TODO: not unified
        //         "dealAvgPrice": "0",
        //         "dealVol": "0",
        //         "orderMargin": "2.2528",
        //         "takerFee": "0",
        //         "makerFee": "0",
        //         "profit": "0",
        //         "feeCurrency": "USDT",
        //         "openType": "1",
        //         "state": "2", // TODO
        //         "externalOid": "_m_0e9520c256744d64b942985189026d20",
        //         "errorCode": "0",
        //         "usedMargin": "0",
        //         "createTime": "1648850305236",
        //         "updateTime": "1648850305245",
        //         "positionMode": "1"
        //     }
        //
        //     stop
        //     {
        //         "id": "265557643326564352",
        //         "triggerType": "1",
        //         "triggerPrice": "3",
        //         "price": "2.9", // not present in stop-market, but in stop-limit order
        //         "executeCycle": "87600",
        //         "trend": "1",
        //          // below keys are same as in regular order structure
        //         "symbol": "STEPN_USDT",
        //         "leverage": "20",
        //         "side": "1",
        //         "vol": "13",
        //         "openType": "1",
        //         "state": "1",
        //         "orderType": "1",
        //         "errorCode": "0",
        //         "createTime": "1648984276000",
        //         "updateTime": "1648984276000",
        //     }
        //
        let id = undefined;
        if (typeof order === 'string') {
            id = order;
        } else {
            id = this.safeString2 (order, 'orderId', 'id');
        }
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (order, 'time', 'createTime');
        let fee = undefined;
        const feeCurrency = this.safeString (order, 'feeCurrency');
        if (feeCurrency !== undefined) {
            const takerFee = this.safeString (order, 'takerFee');
            const makerFee = this.safeString (order, 'makerFee');
            const feeSum = Precise.stringAdd (takerFee, makerFee);
            fee = {
                'currency': feeCurrency,
                'cost': this.parseNumber (feeSum),
            };
        }
        return this.safeOrder ({
            'id': id,
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined, // TODO: this might be 'updateTime' if order-status is filled, otherwise cancellation time. needs to be checked
            'status': this.parseOrderStatus (this.safeString2 (order, 'status', 'state')),
            'symbol': market['symbol'],
            'type': this.parseOrderType (this.safeString (order, 'type')),
            'timeInForce': this.parseOrderTimeInForce (this.safeString (order, 'timeInForce')),
            'side': this.parseOrderSide (this.safeString (order, 'side')),
            'price': this.safeNumber (order, 'price'),
            'stopPrice': this.safeNumber2 (order, 'stopPrice', 'triggerPrice'),
            'average': this.safeNumber (order, 'dealAvgPrice'),
            'amount': this.safeNumber2 (order, 'origQty', 'vol'),
            'cost': this.safeNumber (order, 'cummulativeQuoteQty'),  // 'cummulativeQuoteQty' vs 'origQuoteOrderQty'
            'filled': this.safeNumber2 (order, 'executedQty', 'dealVol'),
            'remaining': undefined,
            'fee': fee,
            'trades': undefined,
            'info': order,
        }, market);
    }

    parseOrderSide (status) {
        const statuses = {
            'BUY': 'buy',
            'SELL': 'sell',
            // contracts v1 : TODO
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

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PARTIALLY_FILLED': 'open',
            'PARTIALLY_CANCELED': 'canceled',
            // contracts v1
            // '1': 'uninformed', // TODO: wt?
            '2': 'open',
            '3': 'closed',
            '4': 'canceled',
            // '5': 'invalid', //  TODO: wt?
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderTimeInForce (status) {
        const statuses = {
            'GTC': 'GTC',
            'FOK': 'FOK',
            'IOC': 'IOC',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchAccountHelper (type, params) {
        if (type === 'spot') {
            return await this.spotPrivateGetAccount (params);
            //
            //     {
            //         "makerCommission": "20",
            //         "takerCommission": "20",
            //         "buyerCommission": "0",
            //         "sellerCommission": "0",
            //         "canTrade": true,
            //         "canWithdraw": true,
            //         "canDeposit": true,
            //         "updateTime": null,
            //         "accountType": "SPOT",
            //         "balances": [
            //             {
            //                 "asset": "BTC",
            //                 "free": "0.002",
            //                 "locked": "0"
            //             },
            //             {
            //                 "asset": "USDT",
            //                 "free": "88.120131350620957006",
            //                 "locked": "0"
            //             },
            //         ],
            //         "permissions": [
            //             "SPOT"
            //         ]
            //     }
            //
        } else if (type === 'swap') {
            const response = this.contractPrivateGetAccountAssets (params);
            //
            //     {
            //         "success":true,
            //         "code":0,
            //         "data":[
            //            {
            //              "currency":"BSV",
            //              "positionMargin":0,
            //              "availableBalance":0,
            //              "cashBalance":0,
            //              "frozenBalance":0,
            //              "equity":0,
            //              "unrealized":0,
            //              "bonus":0
            //           },
            //         ]
            //     }
            //
            return this.safeValue (response, 'data');
        }
    }

    async fetchAccounts (params = {}) {
        // TODO: is the below endpoints suitable for fetchAccounts?
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchAccounts', undefined, params);
        await this.loadMarkets ();
        const response = await this.fetchAccountHelper (marketType, query);
        const data = this.safeValue (response, 'balances', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const account = data[i];
            const currencyId = this.safeString2 (account, 'asset', 'currency');
            const code = this.safeCurrencyCode (currencyId);
            result.push ({
                'id': this.safeString (account, 'id'),
                'type': this.safeString (account, 'type'),
                'code': code,
                'info': account,
            });
        }
        return result;
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.fetchAccountHelper ('spot', params);
        let makerFee = this.safeString (response, 'makerCommission');
        let takerFee = this.safeString (response, 'takerCommission');
        makerFee = Precise.stringDiv (makerFee, '1000');
        takerFee = Precise.stringDiv (takerFee, '1000');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'symbol': symbol,
                'maker': this.parseNumber (makerFee),
                'taker': this.parseNumber (takerFee),
                'percentage': true,
                'tierBased': false,
                'info': response,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name mexc3#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {dict} params extra parameters specific to the mexc3 api endpoint
         * @returns {dict} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const result = {};
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.fetchAccountHelper ('spot', query);
            const balances = this.safeValue (response, 'balances', []);
            for (let i = 0; i < balances.length; i++) {
                const entry = balances[i];
                const currencyId = this.safeString (entry, 'asset');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (entry, 'free');
                account['used'] = this.safeString (entry, 'locked');
                result[code] = account;
            }
        } else if (marketType === 'swap') {
            response = await this.contractPrivateGetAccountAssets (query);
            //
            //     {
            //         "success":true,
            //         "code":0,
            //         "data":[
            //             {"currency":"BSV","positionMargin":0,"availableBalance":0,"cashBalance":0,"frozenBalance":0,"equity":0,"unrealized":0,"bonus":0},
            //             {"currency":"BCH","positionMargin":0,"availableBalance":0,"cashBalance":0,"frozenBalance":0,"equity":0,"unrealized":0,"bonus":0},
            //             {"currency":"CRV","positionMargin":0,"availableBalance":0,"cashBalance":0,"frozenBalance":0,"equity":0,"unrealized":0,"bonus":0},
            //         ]
            //     }
            //
            const data = this.safeValue (response, 'data', []);
            for (let i = 0; i < data.length; i++) {
                const balance = data[i];
                const currencyId = this.safeString (balance, 'currency');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (balance, 'availableBalance');
                account['used'] = this.safeString (balance, 'frozenBalance');
                result[code] = account;
            }
        }
        result['info'] = response;
        return this.safeBalance (result);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        const request = {
            'symbol': market['id'],
        };
        let trades = undefined;
        if (marketType === 'spot') {
            if (since !== undefined) {
                request['start_time'] = since;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            trades = await this.spotPrivateGetMyTrades (this.extend (request, query));
            //
            // spot
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "id": "133948532984922113",
            //             "orderId": "133948532531949568",
            //             "orderListId": "-1",
            //             "price": "41995.51",
            //             "qty": "0.0002",
            //             "quoteQty": "8.399102",
            //             "commission": "0.016798204",
            //             "commissionAsset": "USDT",
            //             "time": "1647718055000",
            //             "isBuyer": true,
            //             "isMaker": false,
            //             "isBestMatch": true
            //         }
            //     ]
            //
        } else {
            if (since !== undefined) {
                request['start_time'] = since;
                const end = this.safeInteger (params, 'end_time');
                if (end === undefined) {
                    request['end_time'] = this.sum (since, this.options['maxTimeTillEnd']);
                }
            }
            if (limit !== undefined) {
                request['page_size'] = limit;
            }
            const response = await this.contractPrivateGetOrderListOrderDeals (this.extend (request, query));
            //
            //     {
            //         "success": true,
            //         "code": "0",
            //         "data": [
            //             {
            //                 "id": "299444585",
            //                 "symbol": "STEPN_USDT",
            //                 "side": "1",
            //                 "vol": "1",
            //                 "price": "2.45455",
            //                 "feeCurrency": "USDT",
            //                 "fee": "0.00147273",
            //                 "timestamp": "1648924557000",
            //                 "profit": "0",
            //                 "category": "1",
            //                 "orderId": "265307163526610432",
            //                 "positionMode": "1",
            //                 "taker": true
            //             }
            //         ]
            //     }
            //
            trades = this.safeValue (response, 'data');
        }
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrderTrades', market, params);
        let trades = undefined;
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires a symbol argument');
            }
            request['symbol'] = market['id'];
            request['orderId'] = id;
            trades = await this.spotPrivateGetMyTrades (this.extend (request, query));
            //
            // spot
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "id": "133948532984922113",
            //             "orderId": "133948532531949568",
            //             "orderListId": "-1",
            //             "price": "41995.51",
            //             "qty": "0.0002",
            //             "quoteQty": "8.399102",
            //             "commission": "0.016798204",
            //             "commissionAsset": "USDT",
            //             "time": "1647718055000",
            //             "isBuyer": true,
            //             "isMaker": false,
            //             "isBestMatch": true
            //         }
            //     ]
            //
        } else {
            request['order_id'] = id;
            const response = await this.contractPrivateGetOrderDealDetailsOrderId (this.extend (request, query));
            //
            //     {
            //         "success": true,
            //         "code": "0",
            //         "data": [
            //             {
            //                 "id": "299444585",
            //                 "symbol": "STEPN_USDT",
            //                 "side": "1",
            //                 "vol": "1",
            //                 "price": "2.45455",
            //                 "feeCurrency": "USDT",
            //                 "fee": "0.00147273",
            //                 "timestamp": "1648924557000",
            //                 "profit": "0",
            //                 "category": "1",
            //                 "orderId": "265307163526610432",
            //                 "positionMode": "1",
            //                 "taker": true
            //             }
            //         ]
            //     }
            //
            trades = this.safeValue (response, 'data');
        }
        return this.parseTrades (trades, market, since, limit, query);
    }

    async modifyMarginHelper (symbol, amount, addOrReduce, params = {}) {
        const positionId = this.safeInteger (params, 'positionId');
        if (positionId === undefined) {
            throw new ArgumentsRequired (this.id + ' modifyMarginHelper() requires a positionId parameter');
        }
        await this.loadMarkets ();
        const request = {
            'positionId': positionId,
            'amount': amount,
            'type': addOrReduce,
        };
        const response = await this.contractPrivatePostPositionChangeMargin (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "code": 0
        //     }
        return response;
    }

    async reduceMargin (symbol, amount, params = {}) {
        return await this.modifyMarginHelper (symbol, amount, 'SUB', params);
    }

    async addMargin (symbol, amount, params = {}) {
        return await this.modifyMarginHelper (symbol, amount, 'ADD', params);
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'leverage': leverage,
        };
        const positionId = this.safeInteger (params, 'positionId');
        if (positionId === undefined) {
            const openType = this.safeNumber (params, 'openType'); // 1 or 2
            const positionType = this.safeNumber (params, 'positionType'); // 1 or 2
            const market = (symbol !== undefined) ? this.market (symbol) : undefined;
            if ((openType === undefined) || (positionType === undefined) || (market === undefined)) {
                throw new ArgumentsRequired (this.id + ' setLeverage() requires a positionId parameter or a symbol argument with openType and positionType parameters, use openType 1 or 2 for isolated or cross margin respectively, use positionType 1 or 2 for long or short positions');
            } else {
                request['openType'] = openType;
                request['symbol'] = market['symbol'];
                request['positionType'] = positionType;
            }
        } else {
            request['positionId'] = positionId;
        }
        return await this.contractPrivatePostPositionChangeLeverage (this.extend (request, params));
    }

    async fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // 'symbol': market['id'],
            // 'position_id': positionId,
            // 'page_num': 1,
            // 'page_size': limit, // default 20, max 100
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.contractPrivateGetPositionFundingRecords (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": {
        //             "pageSize": 20,
        //             "totalCount": 2,
        //             "totalPage": 1,
        //             "currentPage": 1,
        //             "resultList": [
        //                 {
        //                     "id": 7423910,
        //                     "symbol": "BTC_USDT",
        //                     "positionType": 1,
        //                     "positionValue": 29.30024,
        //                     "funding": 0.00076180624,
        //                     "rate": -0.000026,
        //                     "settleTime": 1643299200000
        //                 },
        //                 {
        //                     "id": 7416473,
        //                     "symbol": "BTC_USDT",
        //                     "positionType": 1,
        //                     "positionValue": 28.9188,
        //                     "funding": 0.0014748588,
        //                     "rate": -0.000051,
        //                     "settleTime": 1643270400000
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const resultList = this.safeValue (data, 'resultList', []);
        const result = [];
        for (let i = 0; i < resultList.length; i++) {
            const entry = resultList[i];
            const timestamp = this.safeString (entry, 'settleTime');
            result.push ({
                'info': entry,
                'symbol': symbol,
                'code': undefined,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'id': this.safeNumber (entry, 'id'),
                'amount': this.safeNumber (entry, 'funding'),
            });
        }
        return result;
    }

    parseFundingRate (fundingRate, market = undefined) {
        //
        //     {
        //         "symbol": "BTC_USDT",
        //         "fundingRate": 0.000014,
        //         "maxFundingRate": 0.003,
        //         "minFundingRate": -0.003,
        //         "collectCycle": 8,
        //         "nextSettleTime": 1643241600000,
        //         "timestamp": 1643240373359
        //     }
        //
        const nextFundingRate = this.safeNumber (fundingRate, 'fundingRate');
        const nextFundingTimestamp = this.safeInteger (fundingRate, 'nextSettleTime');
        const marketId = this.safeString (fundingRate, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (fundingRate, 'timestamp');
        const datetime = this.iso8601 (timestamp);
        return {
            'info': fundingRate,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'fundingRate': undefined,
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': nextFundingRate,
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': this.iso8601 (nextFundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchFundingRate (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.contractPublicGetFundingRateSymbol (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": {
        //             "symbol": "BTC_USDT",
        //             "fundingRate": 0.000014,
        //             "maxFundingRate": 0.003,
        //             "minFundingRate": -0.003,
        //             "collectCycle": 8,
        //             "nextSettleTime": 1643241600000,
        //             "timestamp": 1643240373359
        //         }
        //     }
        //
        const result = this.safeValue (response, 'data', {});
        return this.parseFundingRate (result, market);
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mexc#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @param {str|undefined} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int|undefined} since not used by mexc, but filtered internally by ccxt
         * @param {int|undefined} limit mexc limit is page_size default 20, maximum is 100
         * @param {dict} params extra parameters specific to the mexc api endpoint
         * @returns {[dict]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'page_size': limit, // optional
            // 'page_num': 1, // optional, current page number, default is 1
        };
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.contractPublicGetFundingRateHistory (this.extend (request, params));
        //
        //    {
        //        "success": true,
        //        "code": 0,
        //        "data": {
        //            "pageSize": 2,
        //            "totalCount": 21,
        //            "totalPage": 11,
        //            "currentPage": 1,
        //            "resultList": [
        //                {
        //                    "symbol": "BTC_USDT",
        //                    "fundingRate": 0.000266,
        //                    "settleTime": 1609804800000
        //                },
        //                {
        //                    "symbol": "BTC_USDT",
        //                    "fundingRate": 0.00029,
        //                    "settleTime": 1609776000000
        //                }
        //            ]
        //        }
        //    }
        //
        const data = this.safeValue (response, 'data');
        const result = this.safeValue (data, 'resultList', []);
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString (entry, 'symbol');
            const symbol = this.safeSymbol (marketId);
            const timestamp = this.safeString (entry, 'settleTime');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit);
    }

    async fetchLeverageTiers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.contractPublicGetDetail (params);
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "displayName": "BTC_USDT永续",
        //                 "displayNameEn": "BTC_USDT SWAP",
        //                 "positionOpenType": 3,
        //                 "baseCoin": "BTC",
        //                 "quoteCoin": "USDT",
        //                 "settleCoin": "USDT",
        //                 "contractSize": 0.0001,
        //                 "minLeverage": 1,
        //                 "maxLeverage": 125,
        //                 "priceScale": 2,
        //                 "volScale": 0,
        //                 "amountScale": 4,
        //                 "priceUnit": 0.5,
        //                 "volUnit": 1,
        //                 "minVol": 1,
        //                 "maxVol": 1000000,
        //                 "bidLimitPriceRate": 0.1,
        //                 "askLimitPriceRate": 0.1,
        //                 "takerFeeRate": 0.0006,
        //                 "makerFeeRate": 0.0002,
        //                 "maintenanceMarginRate": 0.004,
        //                 "initialMarginRate": 0.008,
        //                 "riskBaseVol": 10000,
        //                 "riskIncrVol": 200000,
        //                 "riskIncrMmr": 0.004,
        //                 "riskIncrImr": 0.004,
        //                 "riskLevelLimit": 5,
        //                 "priceCoefficientVariation": 0.1,
        //                 "indexOrigin": ["BINANCE","GATEIO","HUOBI","MXC"],
        //                 "state": 0, // 0 enabled, 1 delivery, 2 completed, 3 offline, 4 pause
        //                 "isNew": false,
        //                 "isHot": true,
        //                 "isHidden": false
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseLeverageTiers (data, symbols, 'symbol');
    }

    parseMarketLeverageTiers (info, market) {
        /**
            @param info: Exchange response for 1 market
            {
                "symbol": "BTC_USDT",
                "displayName": "BTC_USDT永续",
                "displayNameEn": "BTC_USDT SWAP",
                "positionOpenType": 3,
                "baseCoin": "BTC",
                "quoteCoin": "USDT",
                "settleCoin": "USDT",
                "contractSize": 0.0001,
                "minLeverage": 1,
                "maxLeverage": 125,
                "priceScale": 2,
                "volScale": 0,
                "amountScale": 4,
                "priceUnit": 0.5,
                "volUnit": 1,
                "minVol": 1,
                "maxVol": 1000000,
                "bidLimitPriceRate": 0.1,
                "askLimitPriceRate": 0.1,
                "takerFeeRate": 0.0006,
                "makerFeeRate": 0.0002,
                "maintenanceMarginRate": 0.004,
                "initialMarginRate": 0.008,
                "riskBaseVol": 10000,
                "riskIncrVol": 200000,
                "riskIncrMmr": 0.004,
                "riskIncrImr": 0.004,
                "riskLevelLimit": 5,
                "priceCoefficientVariation": 0.1,
                "indexOrigin": ["BINANCE","GATEIO","HUOBI","MXC"],
                "state": 0, // 0 enabled, 1 delivery, 2 completed, 3 offline, 4 pause
                "isNew": false,
                "isHot": true,
                "isHidden": false
            }
            @param market: CCXT market
         */
        let maintenanceMarginRate = this.safeString (info, 'maintenanceMarginRate');
        let initialMarginRate = this.safeString (info, 'initialMarginRate');
        const maxVol = this.safeString (info, 'maxVol');
        const riskIncrVol = this.safeString (info, 'riskIncrVol');
        const riskIncrMmr = this.safeString (info, 'riskIncrMmr');
        const riskIncrImr = this.safeString (info, 'riskIncrImr');
        let floor = '0';
        const tiers = [];
        const quoteId = this.safeString (info, 'quoteCoin');
        while (Precise.stringLt (floor, maxVol)) {
            const cap = Precise.stringAdd (floor, riskIncrVol);
            tiers.push ({
                'tier': this.parseNumber (Precise.stringDiv (cap, riskIncrVol)),
                'currency': this.safeCurrencyCode (quoteId),
                'notionalFloor': this.parseNumber (floor),
                'notionalCap': this.parseNumber (cap),
                'maintenanceMarginRate': this.parseNumber (maintenanceMarginRate),
                'maxLeverage': this.parseNumber (Precise.stringDiv ('1', initialMarginRate)),
                'info': info,
            });
            initialMarginRate = Precise.stringAdd (initialMarginRate, riskIncrImr);
            maintenanceMarginRate = Precise.stringAdd (maintenanceMarginRate, riskIncrMmr);
            floor = cap;
        }
        return tiers;
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {"chain":"ERC-20","address":"0x55cbd73db24eafcca97369e3f2db74b2490586e6"},
        //     {"chain":"MATIC","address":"0x05aa3236f1970eae0f8feb17ec19435b39574d74"},
        //     {"chain":"TRC20","address":"TGaPfhW41EXD3sAfs1grLF6DKfugfqANNw"},
        //     {"chain":"SOL","address":"5FSpUKuh2gjw4mF89T2e7sEjzUA1SkRKjBChFqP43KhV"},
        //     {"chain":"ALGO","address":"B3XTZND2JJTSYR7R2TQVCUDT4QSSYVAIZYDPWVBX34DGAYATBU3AUV43VU"}
        //
        //
        const address = this.safeString (depositAddress, 'address');
        const code = this.safeCurrencyCode (undefined, currency);
        const networkId = this.safeString (depositAddress, 'chain');
        const network = this.safeNetwork (networkId);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'network': network,
            'info': depositAddress,
        };
    }

    async fetchDepositAddressesByNetwork (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.spot2PrivateGetAssetDepositAddressList (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":{
        //             "currency":"USDC",
        //             "chains":[
        //                 {"chain":"ERC-20","address":"0x55cbd73db24eafcca97369e3f2db74b2490586e6"},
        //                 {"chain":"MATIC","address":"0x05aa3236f1970eae0f8feb17ec19435b39574d74"},
        //                 {"chain":"TRC20","address":"TGaPfhW41EXD3sAfs1grLF6DKfugfqANNw"},
        //                 {"chain":"SOL","address":"5FSpUKuh2gjw4mF89T2e7sEjzUA1SkRKjBChFqP43KhV"},
        //                 {"chain":"ALGO","address":"B3XTZND2JJTSYR7R2TQVCUDT4QSSYVAIZYDPWVBX34DGAYATBU3AUV43VU"}
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const chains = this.safeValue (data, 'chains', []);
        const depositAddresses = [];
        for (let i = 0; i < chains.length; i++) {
            const depositAddress = this.parseDepositAddress (chains[i], currency);
            depositAddresses.push (depositAddress);
        }
        return this.indexBy (depositAddresses, 'network');
    }

    async fetchDepositAddress (code, params = {}) {
        const rawNetwork = this.safeStringUpper (params, 'network');
        params = this.omit (params, 'network');
        const response = await this.fetchDepositAddressesByNetwork (code, params);
        const networks = this.safeValue (this.options, 'networks', {});
        const network = this.safeString (networks, rawNetwork, rawNetwork);
        let result = undefined;
        if (network === undefined) {
            result = this.safeValue (response, code);
            if (result === undefined) {
                const alias = this.safeString (networks, code, code);
                result = this.safeValue (response, alias);
                if (result === undefined) {
                    const defaultNetwork = this.safeString (this.options, 'defaultNetwork', 'ERC20');
                    result = this.safeValue (response, defaultNetwork);
                    if (result === undefined) {
                        const values = Object.values (response);
                        result = this.safeValue (values, 0);
                        if (result === undefined) {
                            throw new InvalidAddress (this.id + ' fetchDepositAddress() cannot find deposit address for ' + code);
                        }
                    }
                }
            }
            return result;
        }
        // TODO: add support for all aliases here
        result = this.safeValue (response, rawNetwork);
        if (result === undefined) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress() cannot find ' + network + ' deposit address for ' + code);
        }
        return result;
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'currency': currency['id'] + network example: USDT-TRX,
            // 'state': 'state',
            // 'start_time': since, // default 1 day
            // 'end_time': this.milliseconds (),
            // 'page_num': 1,
            // 'page_size': limit, // default 20, maximum 50
        };
        let currency = undefined;
        if (code !== undefined) {
            const rawNetwork = this.safeString (params, 'network');
            params = this.omit (params, 'network');
            if (rawNetwork === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDeposits() requires a network parameter when the currency is specified');
            }
            // currently mexc does not have network names unified so for certain things we might need TRX or TRC-20
            // due to that I'm applying the network parameter directly so the user can control it on its side
            currency = this.currency (code);
            request['currency'] = currency['id'] + '-' + rawNetwork;
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.spot2PrivateGetAssetDepositList (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":{
        //             "page_size":20,
        //             "total_page":1,
        //             "total_size":1,
        //             "page_num":1,
        //             "result_list":[
        //                 {
        //                     "currency":"USDC",
        //                     "amount":150.0,
        //                     "fee":0.0,
        //                     "confirmations":19,
        //                     "address":"0x55cbd73db24eafcca97369e3f2db74b2490586e6",
        //                     "state":"SUCCESS",
        //                     "tx_id":"0xc65a9b09e1b71def81bf8bb3ec724c0c1b2b4c82200c8c142e4ea4c1469fd789:0",
        //                     "require_confirmations":12,
        //                     "create_time":"2021-10-11T18:58:25.000+00:00",
        //                     "update_time":"2021-10-11T19:01:06.000+00:00"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const resultList = this.safeValue (data, 'result_list', []);
        return this.parseTransactions (resultList, code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'withdrawal_id': '4b450616042a48c99dd45cacb4b092a7', // string
            // 'currency': currency['id'],
            // 'state': 'state',
            // 'start_time': since, // default 1 day
            // 'end_time': this.milliseconds (),
            // 'page_num': 1,
            // 'page_size': limit, // default 20, maximum 50
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.spot2PrivateGetAssetWithdrawList (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":{
        //             "page_size":20,
        //             "total_page":1,
        //             "total_size":1,
        //             "page_num":1,
        //             "result_list":[
        //                 {
        //                     "id":"4b450616042a48c99dd45cacb4b092a7",
        //                     "currency":"USDT-TRX",
        //                     "address":"TRHKnx74Gb8UVcpDCMwzZVe4NqXfkdtPak",
        //                     "amount":30.0,
        //                     "fee":1.0,
        //                     "remark":"this is my first withdrawal remark",
        //                     "state":"WAIT",
        //                     "create_time":"2021-10-11T20:45:08.000+00:00"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const resultList = this.safeValue (data, 'result_list', []);
        return this.parseTransactions (resultList, code, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "currency":"USDC",
        //         "amount":150.0,
        //         "fee":0.0,
        //         "confirmations":19,
        //         "address":"0x55cbd73db24eafcca97369e3f2db74b2490586e6",
        //         "state":"SUCCESS",
        //         "tx_id":"0xc65a9b09e1b71def81bf8bb3ec724c0c1b2b4c82200c8c142e4ea4c1469fd789:0",
        //         "require_confirmations":12,
        //         "create_time":"2021-10-11T18:58:25.000+00:00",
        //         "update_time":"2021-10-11T19:01:06.000+00:00"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "id":"4b450616042a48c99dd45cacb4b092a7",
        //         "currency":"USDT-TRX",
        //         "address":"TRHKnx74Gb8UVcpDCMwzZVe4NqXfkdtPak",
        //         "amount":30.0,
        //         "fee":1.0,
        //         "remark":"this is my first withdrawal remark",
        //         "state":"WAIT",
        //         "create_time":"2021-10-11T20:45:08.000+00:00"
        //     }
        //
        // withdraw
        //
        //     {
        //         "withdrawId":"25fb2831fb6d4fc7aa4094612a26c81d"
        //     }
        //
        const id = this.safeString2 (transaction, 'id', 'withdrawId');
        const type = (id === undefined) ? 'deposit' : 'withdrawal';
        const timestamp = this.parse8601 (this.safeString (transaction, 'create_time'));
        const updated = this.parse8601 (this.safeString (transaction, 'update_time'));
        let currencyId = this.safeString (transaction, 'currency');
        let network = undefined;
        if ((currencyId !== undefined) && (currencyId.indexOf ('-') >= 0)) {
            const parts = currencyId.split ('-');
            currencyId = this.safeString (parts, 0);
            const networkId = this.safeString (parts, 1);
            network = this.safeNetwork (networkId);
        }
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        let amountString = this.safeString (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const txid = this.safeString (transaction, 'tx_id');
        let fee = undefined;
        const feeCostString = this.safeString (transaction, 'fee');
        if (feeCostString !== undefined) {
            fee = {
                'cost': this.parseNumber (feeCostString),
                'currency': code,
            };
        }
        if (type === 'withdrawal') {
            // mexc withdrawal amount includes the fee
            amountString = Precise.stringSub (amountString, feeCostString);
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': this.parseNumber (amountString),
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'WAIT': 'pending',
            'WAIT_PACKAGING': 'pending',
            'SUCCESS': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchPosition (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.fetchPositions (undefined, this.extend (request, params));
        return this.safeValue (response, 0);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.contractPrivateGetPositionOpenPositions (params);
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": [
        //             {
        //                 "positionId": 1394650,
        //                 "symbol": "ETH_USDT",
        //                 "positionType": 1,
        //                 "openType": 1,
        //                 "state": 1,
        //                 "holdVol": 1,
        //                 "frozenVol": 0,
        //                 "closeVol": 0,
        //                 "holdAvgPrice": 1217.3,
        //                 "openAvgPrice": 1217.3,
        //                 "closeAvgPrice": 0,
        //                 "liquidatePrice": 1211.2,
        //                 "oim": 0.1290338,
        //                 "im": 0.1290338,
        //                 "holdFee": 0,
        //                 "realised": -0.0073,
        //                 "leverage": 100,
        //                 "createTime": 1609991676000,
        //                 "updateTime": 1609991676000,
        //                 "autoAddIm": false
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parsePositions (data, symbols);
    }

    parsePosition (position, market = undefined) {
        //
        //     {
        //         "positionId": 1394650,
        //         "symbol": "ETH_USDT",
        //         "positionType": 1,
        //         "openType": 1,
        //         "state": 1,
        //         "holdVol": 1,
        //         "frozenVol": 0,
        //         "closeVol": 0,
        //         "holdAvgPrice": 1217.3,
        //         "openAvgPrice": 1217.3,
        //         "closeAvgPrice": 0,
        //         "liquidatePrice": 1211.2,
        //         "oim": 0.1290338,
        //         "im": 0.1290338,
        //         "holdFee": 0,
        //         "realised": -0.0073,
        //         "leverage": 100,
        //         "createTime": 1609991676000,
        //         "updateTime": 1609991676000,
        //         "autoAddIm": false
        //     }
        //
        market = this.safeMarket (this.safeString (position, 'symbol'), market);
        const symbol = market['symbol'];
        const contracts = this.safeString (position, 'holdVol');
        const entryPrice = this.safeNumber (position, 'openAvgPrice');
        const initialMargin = this.safeString (position, 'im');
        const rawSide = this.safeString (position, 'positionType');
        const side = (rawSide === '1') ? 'long' : 'short';
        const openType = this.safeString (position, 'margin_mode');
        const marginType = (openType === '1') ? 'isolated' : 'cross';
        const leverage = this.safeNumber (position, 'leverage');
        const liquidationPrice = this.safeNumber (position, 'liquidatePrice');
        const timestamp = this.safeNumber (position, 'updateTime');
        return {
            'info': position,
            'symbol': symbol,
            'contracts': this.parseNumber (contracts),
            'contractSize': undefined,
            'entryPrice': entryPrice,
            'collateral': undefined,
            'side': side,
            'unrealizedProfit': undefined,
            'leverage': this.parseNumber (leverage),
            'percentage': undefined,
            'marginType': marginType,
            'notional': undefined,
            'markPrice': undefined,
            'liquidationPrice': liquidationPrice,
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'marginRatio': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    async fetchTransfer (id, since = undefined, limit = undefined, params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTransfer', undefined, params);
        await this.loadMarkets ();
        if (marketType === 'spot') {
            const request = {
                'transact_id': id,
            };
            const response = await this.spot2PrivateGetAssetInternalTransferInfo (this.extend (request, query));
            //
            //     {
            //         code: '200',
            //         data: {
            //             currency: 'USDT',
            //             amount: '1',
            //             transact_id: '954877a2ef54499db9b28a7cf9ebcf41',
            //             from: 'MAIN',
            //             to: 'CONTRACT',
            //             transact_state: 'SUCCESS'
            //         }
            //     }
            //
            const data = this.safeValue (response, 'data', {});
            return this.parseTransfer (data);
        } else if (marketType === 'swap') {
            throw new BadRequest (this.id + ' fetchTransfer() is not supported for ' + marketType);
        }
    }

    async fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTransfers', undefined, params);
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        let resultList = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (marketType === 'spot') {
            if (since !== undefined) {
                request['start_time'] = since;
            }
            if (limit !== undefined) {
                if (limit > 50) {
                    throw new ExchangeError ('This exchange supports a maximum limit of 50');
                }
                request['page-size'] = limit;
            }
            const response = await this.spot2PrivateGetAssetInternalTransferRecord (this.extend (request, query));
            //
            //     {
            //         code: '200',
            //         data: {
            //             total_page: '1',
            //             total_size: '5',
            //             result_list: [{
            //                     currency: 'USDT',
            //                     amount: '1',
            //                     transact_id: '954877a2ef54499db9b28a7cf9ebcf41',
            //                     from: 'MAIN',
            //                     to: 'CONTRACT',
            //                     transact_state: 'SUCCESS'
            //                 },
            //                 ...
            //             ]
            //         }
            //     }
            //
            const data = this.safeValue (response, 'data', {});
            resultList = this.safeValue (data, 'result_list', []);
        } else if (marketType === 'swap') {
            if (limit !== undefined) {
                request['page_size'] = limit;
            }
            const response = await this.contractPrivateGetAccountTransferRecord (this.extend (request, query));
            const data = this.safeValue (response, 'data');
            resultList = this.safeValue (data, 'resultList');
            //
            //     {
            //         "success": true,
            //         "code": "0",
            //         "data": {
            //             "pageSize": "20",
            //             "totalCount": "10",
            //             "totalPage": "1",
            //             "currentPage": "1",
            //             "resultList": [
            //                 {
            //                     "id": "2980812",
            //                     "txid": "fa8a1e7bf05940a3b7025856dc48d025",
            //                     "currency": "USDT",
            //                     "amount": "22.90213135",
            //                     "type": "IN",
            //                     "state": "SUCCESS",
            //                     "createTime": "1648849076000",
            //                     "updateTime": "1648849076000"
            //                 },
            //             ]
            //         }
            //     }
            //
        }
        return this.parseTransfers (resultList, currency, since, limit);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accounts = {
            'spot': 'MAIN',
            'swap': 'CONTRACT',
        };
        const fromId = this.safeString (accounts, fromAccount);
        const toId = this.safeString (accounts, toAccount);
        if (fromId === undefined) {
            const keys = Object.keys (accounts);
            throw new ExchangeError (this.id + ' fromAccount must be one of ' + keys.join (', '));
        }
        if (toId === undefined) {
            const keys = Object.keys (accounts);
            throw new ExchangeError (this.id + ' toAccount must be one of ' + keys.join (', '));
        }
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'from': fromId,
            'to': toId,
        };
        const response = await this.spot2PrivatePostAssetInternalTransfer (this.extend (request, params));
        //
        //     {
        //         code: '200',
        //         data: {
        //             currency: 'USDT',
        //             amount: '1',
        //             transact_id: 'b60c1df8e7b24b268858003f374ecb75',
        //             from: 'MAIN',
        //             to: 'CONTRACT',
        //             transact_state: 'WAIT'
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransfer (data, currency);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        // spot:
        //
        //     {
        //         currency: 'USDT',
        //         amount: '1',
        //         transact_id: 'b60c1df8e7b24b268858003f374ecb75',
        //         from: 'MAIN',
        //         to: 'CONTRACT',
        //         transact_state: 'WAIT'
        //     }
        //
        // swap
        //
        //     {
        //         "currency": "USDT",
        //         "amount": "22.90213135",
        //         "txid": "fa8a1e7bf05940a3b7025856dc48d025",
        //         "id": "2980812",
        //         "type": "IN",
        //         "state": "SUCCESS",
        //         "createTime": "1648849076000",
        //         "updateTime": "1648849076000"
        //     }
        //
        const currencyId = this.safeString (transfer, 'currency');
        const id = this.safeString2 (transfer, 'transact_id', 'txid');
        const timestamp = this.safeInteger (transfer, 'createTime');
        const datetime = (timestamp !== undefined) ? this.iso8601 (timestamp) : undefined;
        const direction = this.safeString (transfer, 'type');
        let accountFrom = undefined;
        let accountTo = undefined;
        if (direction !== undefined) {
            accountFrom = (direction === 'IN') ? 'MAIN' : 'CONTRACT';
            accountTo = (direction === 'IN') ? 'CONTRACT' : 'MAIN';
        } else {
            accountFrom = this.safeString (transfer, 'from');
            accountTo = this.safeString (transfer, 'to');
        }
        return {
            'info': transfer,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': this.parseAccountId (accountFrom),
            'toAccount': this.parseAccountId (accountTo),
            'status': this.parseTransferStatus (this.safeString2 (transfer, 'transact_state', 'state')),
        };
    }

    parseAccountId (status) {
        const statuses = {
            'MAIN': 'spot',
            'CONTRACT': 'swap',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransferStatus (status) {
        const statuses = {
            'SUCCESS': 'ok',
            'FAILED': 'failed',
            'WAIT': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeString2 (params, 'network', 'chain'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString (networks, network, network); // handle ETH > ERC-20 alias
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (tag !== undefined) {
            address += ':' + tag;
        }
        const request = {
            'currency': currency['id'],
            'address': address,
            'amount': amount,
        };
        if (network !== undefined) {
            request['chain'] = network;
            params = this.omit (params, [ 'network', 'chain' ]);
        }
        const response = await this.spot2PrivatePostAssetWithdraw (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data": {
        //             "withdrawId":"25fb2831fb6d4fc7aa4094612a26c81d"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransaction (data, currency);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const [ section, access ] = api;
        [ path, params ] = this.resolvePath (path, params);
        let url = undefined;
        if (section === 'spot') {
            url = this.urls['api'][section][access] + '/api/' + this.version + '/' + path;
            let paramsEncoded = '';
            if (access === 'private') {
                params['timestamp'] = this.milliseconds ();
                params['recvWindow'] = this.safeInteger (this.options, 'recvWindow', 5000);
            }
            if (Object.keys (params).length) {
                paramsEncoded = this.urlencode (params);
                url += '?' + paramsEncoded;
            }
            if (access === 'private') {
                this.checkRequiredCredentials ();
                const signature = this.hmac (this.encode (paramsEncoded), this.encode (this.secret), 'sha256');
                url += '&' + 'signature=' + signature;
                headers = {
                    'X-MEXC-APIKEY': this.apiKey,
                };
            }
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
            }
        } else if (section === 'contract' || section === 'spot2') {
            url = this.urls['api'][section][access] + '/' + this.implodeParams (path, params);
            params = this.omit (params, this.extractParams (path));
            if (access === 'public') {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            } else {
                this.checkRequiredCredentials ();
                const timestamp = this.milliseconds ().toString ();
                let auth = '';
                headers = {
                    'ApiKey': this.apiKey,
                    'Request-Time': timestamp,
                    'Content-Type': 'application/json',
                };
                if (method === 'POST') {
                    auth = this.json (params);
                    body = auth;
                } else {
                    params = this.keysort (params);
                    if (Object.keys (params).length) {
                        auth += this.urlencode (params);
                        url += '?' + auth;
                    }
                }
                auth = this.apiKey + timestamp + auth;
                const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
                headers['Signature'] = signature;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        // spot
        //     {"code":-1128,"msg":"Combination of optional parameters invalid.","_extend":null}
        //     {"success":false,"code":123456,"message":"Order quantity error...."}
        //
        // contract
        //
        //     {"code":10232,"msg":"The currency not exist"}
        //     {"code":10216,"msg":"No available deposit address"}
        //     {"success":true, "code":0, "data":1634095541710}
        //
        const success = this.safeValue (response, 'success', false); // v1
        if (success === true) {
            return;
        }
        const responseCode = this.safeString (response, 'code', undefined);
        if ((responseCode !== undefined) && (responseCode !== '200') && (responseCode !== '0')) {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], responseCode, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
