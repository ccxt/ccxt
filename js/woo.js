'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, RateLimitExceeded, BadRequest, ExchangeError, InvalidOrder } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class woo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'woo',
            'name': 'WOO X',
            'countries': [ 'KY' ], // Cayman Islands
            'rateLimit': 100,
            'version': 'v1',
            'certified': false,
            'hostname': 'woo.org',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelWithdraw': false, // exchange have that endpoint disabled atm, but was once implemented in ccxt per old docs: https://kronosresearch.github.io/wootrade-documents/#cancel-withdraw-request
                'createDepositAddress': false,
                'createMarketOrder': false,
                'createOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': true,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'repayMargin': true,
                'setLeverage': true,
                'setMargin': false,
                'transfer': true,
                'withdraw': false, // exchange have that endpoint disabled atm, but was once implemented in ccxt per old docs: https://kronosresearch.github.io/wootrade-documents/#token-withdraw
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1mon',
                '1y': '1y',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/150730761-1a00e5e0-d28c-480f-9e65-089ce3e6ef3b.jpg',
                'api': {
                    'pub': 'https://api-pub.woo.org',
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'test': {
                    'pub': 'https://api-pub.staging.woo.org',
                    'public': 'https://api.staging.woo.org',
                    'private': 'https://api.staging.woo.org',
                },
                'www': 'https://woo.org/',
                'doc': [
                    'https://docs.woo.org/',
                ],
                'fees': [
                    'https://support.woo.org/hc/en-001/articles/4404611795353--Trading-Fees',
                ],
                'referral': 'https://referral.woo.org/BAJS6oNmZb3vi3RGA',
            },
            'api': {
                'v1': {
                    'pub': {
                        'get': {
                            'hist/kline': 10,
                        },
                    },
                    'public': {
                        'get': {
                            'info': 1,
                            'info/{symbol}': 1,
                            'market_trades': 1,
                            'token': 1,
                            'token_network': 1,
                            'funding_rates': 1,
                            'funding_rate/{symbol}': 1,
                            'funding_rate_history': 1,
                            'futures': 1,
                            'futures/{symbol}': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'client/token': 1,
                            'order/{oid}': 1,
                            'client/order/{client_order_id}': 1,
                            'orders': 1,
                            'orderbook/{symbol}': 1,
                            'kline': 1,
                            'client/trade/{tid}': 1,
                            'order/{oid}/trades': 1,
                            'client/trades': 1,
                            'client/info': 60,
                            'asset/deposit': 120,
                            'asset/history': 60,
                            'sub_account/all': 60,
                            'sub_account/assets': 60,
                            'token_interest': 60,
                            'token_interest/{token}': 60,
                            'interest/history': 60,
                            'interest/repay': 60,
                            'funding_fee/history': 30,
                            'positions': 3.33, // 30 requests per 10 seconds
                            'position/{symbol}': 3.33,
                        },
                        'post': {
                            'order': 5, // 2 requests per 1 second per symbol
                            'asset/main_sub_transfer': 30, // 20 requests per 60 seconds
                            'asset/withdraw': 120,  // implemented in ccxt, disabled on the exchange side https://kronosresearch.github.io/wootrade-documents/#token-withdraw
                            'interest/repay': 60,
                            'client/account_mode': 120,
                            'client/leverage': 120,
                        },
                        'delete': {
                            'order': 1,
                            'client/order': 1,
                            'orders': 1,
                            'asset/withdraw': 120,  // implemented in ccxt, disabled on the exchange side https://kronosresearch.github.io/wootrade-documents/#cancel-withdraw-request
                        },
                    },
                },
                'v2': {
                    'private': {
                        'get': {
                            'client/holding': 1,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0005'),
                },
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                // these network aliases require manual mapping here
                'network-aliases-for-tokens': {
                    'HT': 'ERC20',
                    'OMG': 'ERC20',
                    'UATOM': 'ATOM',
                    'ZRX': 'ZRX',
                },
                // override defaultNetworkCodePriorities for a specific currency
                'defaultNetworkCodeForCurrencies': {
                    // 'USDT': 'TRC20',
                    // 'BTC': 'BTC',
                },
                'transfer': {
                    'fillResponseFromRequest': true,
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    '-1000': ExchangeError, // { "code": -1000,  "message": "An unknown error occurred while processing the request" }
                    '-1001': AuthenticationError, // { "code": -1001,  "message": "The api key or secret is in wrong format" }
                    '-1002': AuthenticationError, // { "code": -1002,  "message": "API key or secret is invalid, it may because key have insufficient permission or the key is expired/revoked." }
                    '-1003': RateLimitExceeded, // { "code": -1003,  "message": "Rate limit exceed." }
                    '-1004': BadRequest, // { "code": -1004,  "message": "An unknown parameter was sent." }
                    '-1005': BadRequest, // { "code": -1005,  "message": "Some parameters are in wrong format for api." }
                    '-1006': BadRequest, // { "code": -1006,  "message": "The data is not found in server." }
                    '-1007': BadRequest, // { "code": -1007,  "message": "The data is already exists or your request is duplicated." }
                    '-1008': InvalidOrder, // { "code": -1008,  "message": "The quantity of settlement is too high than you can request." }
                    '-1009': BadRequest, // { "code": -1009,  "message": "Can not request withdrawal settlement, you need to deposit other arrears first." }
                    '-1011': ExchangeError, // { "code": -1011,  "message": "Can not place/cancel orders, it may because internal network error. Please try again in a few seconds." }
                    '-1012': BadRequest, // { "code": -1012,  "message": "Amount is required for buy market orders when margin disabled."}  The place/cancel order request is rejected by internal module, it may because the account is in liquidation or other internal errors. Please try again in a few seconds." }
                    '-1101': InvalidOrder, // { "code": -1101,  "message": "The risk exposure for client is too high, it may cause by sending too big order or the leverage is too low. please refer to client info to check the current exposure." }
                    '-1102': InvalidOrder, // { "code": -1102,  "message": "The order value (price * size) is too small." }
                    '-1103': InvalidOrder, // { "code": -1103,  "message": "The order price is not following the tick size rule for the symbol." }
                    '-1104': InvalidOrder, // { "code": -1104,  "message": "The order quantity is not following the step size rule for the symbol." }
                    '-1105': InvalidOrder, // { "code": -1105,  "message": "Price is X% too high or X% too low from the mid price." }
                },
                'broad': {
                    'symbol must not be blank': BadRequest, // when sending 'cancelOrder' without symbol [-1005]
                    'The token is not supported': BadRequest, // when getting incorrect token's deposit address [-1005]
                    'Your order and symbol are not valid or already canceled': BadRequest, // actual response whensending 'cancelOrder' for already canceled id [-1006]
                    'Insufficient WOO. Please enable margin trading for leverage trading': BadRequest, // when selling insufficent token [-1012]
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name woo#fetchMarkets
         * @description retrieves data on all markets for woo
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.v1PublicGetInfo (params);
        //
        // {
        //     rows: [
        //         {
        //             symbol: "SPOT_AAVE_USDT",
        //             quote_min: 0,
        //             quote_max: 100000,
        //             quote_tick: 0.01,
        //             base_min: 0.01,
        //             base_max: 7284,
        //             base_tick: 0.0001,
        //             min_notional: 10,
        //             price_range: 0.1,
        //             created_time: "0",
        //             updated_time: "1639107647.988",
        //             is_stable: 0
        //         },
        //         ...
        //     success: true
        // }
        //
        const result = [];
        const data = this.safeValue (response, 'rows', []);
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const marketId = this.safeString (market, 'symbol');
            const parts = marketId.split ('_');
            let marketType = this.safeStringLower (parts, 0);
            const isSpot = marketType === 'spot';
            const isSwap = marketType === 'perp';
            const baseId = this.safeString (parts, 1);
            const quoteId = this.safeString (parts, 2);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let settleId = undefined;
            let settle = undefined;
            let symbol = base + '/' + quote;
            let contractSize = undefined;
            let linear = undefined;
            if (isSwap) {
                settleId = this.safeString (parts, 2);
                settle = this.safeCurrencyCode (settleId);
                symbol = base + '/' + quote + ':' + settle;
                contractSize = this.parseNumber ('1');
                marketType = 'swap';
                linear = true;
            }
            result.push ({
                'id': marketId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': marketType,
                'spot': isSpot,
                'margin': true,
                'swap': isSwap,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': isSwap,
                'linear': linear,
                'inverse': undefined,
                'contractSize': contractSize,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'base_tick'),
                    'price': this.safeNumber (market, 'quote_tick'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'base_min'),
                        'max': this.safeNumber (market, 'base_max'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'quote_min'),
                        'max': this.safeNumber (market, 'quote_max'),
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_notional'),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PublicGetMarketTrades (this.extend (request, params));
        //
        // {
        //     success: true,
        //     rows: [
        //         {
        //             symbol: "SPOT_BTC_USDT",
        //             side: "SELL",
        //             executed_price: 46222.35,
        //             executed_quantity: 0.0012,
        //             executed_timestamp: "1641241162.329"
        //         },
        //         {
        //             symbol: "SPOT_BTC_USDT",
        //             side: "SELL",
        //             executed_price: 46222.35,
        //             executed_quantity: 0.0012,
        //             executed_timestamp: "1641241162.329"
        //         },
        //         {
        //             symbol: "SPOT_BTC_USDT",
        //             side: "BUY",
        //             executed_price: 46224.32,
        //             executed_quantity: 0.00039,
        //             executed_timestamp: "1641241162.287"
        //         },
        //         ...
        //      ]
        // }
        //
        const resultResponse = this.safeValue (response, 'rows', {});
        return this.parseTrades (resultResponse, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public/market_trades
        //
        //     {
        //         symbol: "SPOT_BTC_USDT",
        //         side: "SELL",
        //         executed_price: 46222.35,
        //         executed_quantity: 0.0012,
        //         executed_timestamp: "1641241162.329"
        //     }
        //
        // fetchOrderTrades, fetchOrder
        //
        //     {
        //         id: '99119876',
        //         symbol: 'SPOT_WOO_USDT',
        //         fee: '0.0024',
        //         side: 'BUY',
        //         executed_timestamp: '1641481113.084',
        //         order_id: '87001234',
        //         order_tag: 'default', <-- this param only in "fetchOrderTrades"
        //         executed_price: '1',
        //         executed_quantity: '12',
        //         fee_asset: 'WOO',
        //         is_maker: '1'
        //     }
        //
        const isFromFetchOrder = ('id' in trade);
        const timestamp = this.safeTimestamp (trade, 'executed_timestamp');
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString (trade, 'executed_price');
        const amount = this.safeString (trade, 'executed_quantity');
        const order_id = this.safeString (trade, 'order_id');
        const fee = this.parseTokenAndFeeTemp (trade, 'fee_asset', 'fee');
        const cost = Precise.stringMul (price, amount);
        const side = this.safeStringLower (trade, 'side');
        const id = this.safeString (trade, 'id');
        let takerOrMaker = undefined;
        if (isFromFetchOrder) {
            const isMaker = this.safeString (trade, 'is_maker') === '1';
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': order_id,
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    parseTokenAndFeeTemp (item, feeTokenKey, feeAmountKey) {
        const feeCost = this.safeString (item, feeAmountKey);
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (item, feeTokenKey);
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return fee;
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name woo#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.v1PrivateGetClientInfo (params);
        //
        //     {
        //         "application":{
        //             "id":45585,
        //             "leverage":3.00,
        //             "otpauth":false,
        //             "alias":"email@address.com",
        //             "application_id":"c2cc4d74-c8cb-4e10-84db-af2089b8c68a",
        //             "account":"email@address.com",
        //             "account_mode":"PURE_SPOT",
        //             "taker_fee_rate":5.00,
        //             "maker_fee_rate":2.00,
        //             "interest_rate":0.00,
        //             "futures_leverage":1.00,
        //             "futures_taker_fee_rate":5.00,
        //             "futures_maker_fee_rate":2.00
        //         },
        //         "margin_rate":1000,
        //         "success":true
        //     }
        //
        const application = this.safeValue (response, 'application', {});
        const maker = this.safeString (application, 'maker_fee_rate');
        const taker = this.safeString (application, 'taker_fee_rate');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': this.parseNumber (Precise.stringDiv (maker, '10000')),
                'taker': this.parseNumber (Precise.stringDiv (taker, '10000')),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name woo#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const result = {};
        const tokenResponse = await this.v1PublicGetToken (params);
        //
        // {
        //     rows: [
        //         {
        //             token: "ETH_USDT",
        //             fullname: "Tether",
        //             decimals: 6,
        //             balance_token: "USDT",
        //             created_time: "0",
        //             updated_time: "0"
        //         },
        //         {
        //             token: "BSC_USDT",
        //             fullname: "Tether",
        //             decimals: 18,
        //             balance_token: "USDT",
        //             created_time: "0",
        //             updated_time: "0"
        //         },
        //         {
        //             token: "ZEC",
        //             fullname: "ZCash",
        //             decimals: 8,
        //             balance_token: "ZEC",
        //             created_time: "0",
        //             updated_time: "0"
        //         },
        //         ...
        //     ],
        //     success: true
        // }
        //
        // only make one request for currrencies...
        // const tokenNetworkResponse = await this.v1PublicGetTokenNetwork (params);
        //
        // {
        //     rows: [
        //         {
        //             protocol: "ERC20",
        //             token: "USDT",
        //             name: "Ethereum",
        //             minimum_withdrawal: 30,
        //             withdrawal_fee: 25,
        //             allow_deposit: 1,
        //             allow_withdraw: 1
        //         },
        //         {
        //             protocol: "TRC20",
        //             token: "USDT",
        //             name: "Tron",
        //             minimum_withdrawal: 30,
        //             withdrawal_fee: 1,
        //             allow_deposit: 1,
        //             allow_withdraw: 1
        //         },
        //         ...
        //     ],
        //     success: true
        // }
        //
        const tokenRows = this.safeValue (tokenResponse, 'rows', []);
        const networksByCurrencyId = this.groupBy (tokenRows, 'balance_token');
        const currencyIds = Object.keys (networksByCurrencyId);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const networks = networksByCurrencyId[currencyId];
            const code = this.safeCurrencyCode (currencyId);
            let name = undefined;
            let minPrecision = undefined;
            const resultingNetworks = {};
            for (let j = 0; j < networks.length; j++) {
                const network = networks[j];
                name = this.safeString (network, 'fullname');
                const networkId = this.safeString (network, 'token');
                const splitted = networkId.split ('_');
                const unifiedNetwork = splitted[0];
                const precision = this.parsePrecision (this.safeString (network, 'decimals'));
                if (precision !== undefined) {
                    minPrecision = (minPrecision === undefined) ? precision : Precise.stringMin (precision, minPrecision);
                }
                resultingNetworks[unifiedNetwork] = {
                    'id': networkId,
                    'network': unifiedNetwork,
                    'limits': {
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'deposit': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                    'active': undefined,
                    'deposit': undefined,
                    'withdraw': undefined,
                    'fee': undefined,
                    'precision': this.parseNumber (precision),
                    'info': network,
                };
            }
            result[code] = {
                'id': currencyId,
                'name': name,
                'code': code,
                'precision': this.parseNumber (minPrecision),
                'active': undefined,
                'fee': undefined,
                'networks': resultingNetworks,
                'limits': {
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': networks,
            };
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name woo#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const reduceOnly = this.safeValue (params, 'reduceOnly');
        const orderType = type.toUpperCase ();
        if (reduceOnly !== undefined) {
            if (orderType !== 'LIMIT') {
                throw new InvalidOrder (this.id + ' createOrder() only support reduceOnly for limit orders');
            }
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderSide = side.toUpperCase ();
        const request = {
            'symbol': market['id'],
            'order_type': orderType, // LIMIT/MARKET/IOC/FOK/POST_ONLY/ASK/BID
            'side': orderSide,
        };
        if (reduceOnly) {
            request['reduce_only'] = reduceOnly;
        }
        if (price !== undefined) {
            request['order_price'] = this.priceToPrecision (symbol, price);
        }
        if (orderType === 'MARKET') {
            // for market buy it requires the amount of quote currency to spend
            if (orderSide === 'BUY') {
                const cost = this.safeNumber (params, 'cost');
                if (this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true)) {
                    if (cost === undefined) {
                        if (price === undefined) {
                            throw new InvalidOrder (this.id + " createOrder() requires the price argument for market buy orders to calculate total order cost. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or alternatively, supply the total cost value in the 'order_amount' in  exchange-specific parameters");
                        } else {
                            const amountString = this.numberToString (amount);
                            const priceString = this.numberToString (price);
                            const orderAmount = Precise.stringMul (amountString, priceString);
                            request['order_amount'] = this.costToPrecision (symbol, orderAmount);
                        }
                    } else {
                        request['order_amount'] = this.costToPrecision (symbol, cost);
                    }
                }
            } else {
                request['order_quantity'] = this.amountToPrecision (symbol, amount);
            }
        } else {
            request['order_quantity'] = this.amountToPrecision (symbol, amount);
        }
        const clientOrderId = this.safeString2 (params, 'clOrdID', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
        params = this.omit (params, [ 'clOrdID', 'clientOrderId' ]);
        const response = await this.v1PrivatePostOrder (this.extend (request, params));
        // {
        //     success: true,
        //     timestamp: '1641383206.489',
        //     order_id: '86980774',
        //     order_type: 'LIMIT',
        //     order_price: '1', // null for 'MARKET' order
        //     order_quantity: '12', // null for 'MARKET' order
        //     order_amount: null, // NOT-null for 'MARKET' order
        //     client_order_id: '0'
        // }
        return this.extend (
            this.parseOrder (response, market),
            { 'type': type }
        );
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name woo#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {};
        const clientOrderIdUnified = this.safeString2 (params, 'clOrdID', 'clientOrderId');
        const clientOrderIdExchangeSpecific = this.safeString2 (params, 'client_order_id', clientOrderIdUnified);
        const isByClientOrder = clientOrderIdExchangeSpecific !== undefined;
        if (isByClientOrder) {
            request['client_order_id'] = clientOrderIdExchangeSpecific;
            params = this.omit (params, [ 'clOrdID', 'clientOrderId', 'client_order_id' ]);
        } else {
            request['order_id'] = id;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        request['symbol'] = market['id'];
        const response = await this.v1PrivateDeleteOrder (this.extend (request, params));
        //
        // { success: true, status: 'CANCEL_SENT' }
        //
        const extendParams = { 'symbol': symbol };
        if (isByClientOrder) {
            extendParams['client_order_id'] = clientOrderIdExchangeSpecific;
        } else {
            extendParams['id'] = id;
        }
        return this.extend (this.parseOrder (response), extendParams);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name woo#cancelAllOrders
         * @description cancel all open orders in a market
         * @param {string|undefined} symbol unified market symbol
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' canelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PrivateDeleteOrders (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "status":"CANCEL_ALL_SENT"
        //     }
        //
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const request = {};
        const clientOrderId = this.safeString2 (params, 'clOrdID', 'clientOrderId');
        let chosenSpotMethod = undefined;
        if (clientOrderId) {
            chosenSpotMethod = 'v1PrivateGetClientOrderClientOrderId';
            request['client_order_id'] = clientOrderId;
        } else {
            chosenSpotMethod = 'v1PrivateGetOrderOid';
            request['oid'] = id;
        }
        const response = await this[chosenSpotMethod] (this.extend (request, params));
        //
        // {
        //     success: true,
        //     symbol: 'SPOT_WOO_USDT',
        //     status: 'FILLED', // FILLED, NEW
        //     side: 'BUY',
        //     created_time: '1641480933.000',
        //     order_id: '87541111',
        //     order_tag: 'default',
        //     price: '1',
        //     type: 'LIMIT',
        //     quantity: '12',
        //     amount: null,
        //     visible: '12',
        //     executed: '12', // or any partial amount
        //     total_fee: '0.0024',
        //     fee_asset: 'WOO',
        //     client_order_id: null,
        //     average_executed_price: '1',
        //     Transactions: [
        //       {
        //         id: '99111647',
        //         symbol: 'SPOT_WOO_USDT',
        //         fee: '0.0024',
        //         side: 'BUY',
        //         executed_timestamp: '1641482113.084',
        //         order_id: '87541111',
        //         executed_price: '1',
        //         executed_quantity: '12',
        //         fee_asset: 'WOO',
        //         is_maker: '1'
        //       }
        //     ]
        // }
        //
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        const response = await this.v1PrivateGetOrders (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "meta":{
        //             "total":1,
        //             "records_per_page":100,
        //             "current_page":1
        //         },
        //         "rows":[
        //             {
        //                 "symbol":"PERP_BTC_USDT",
        //                 "status":"FILLED",
        //                 "side":"SELL",
        //                 "created_time":"1611617776.000",
        //                 "updated_time":"1611617776.000",
        //                 "order_id":52121167,
        //                 "order_tag":"default",
        //                 "price":null,
        //                 "type":"MARKET",
        //                 "quantity":0.002,
        //                 "amount":null,
        //                 "visible":0,
        //                 "executed":0.002,
        //                 "total_fee":0.01732885,
        //                 "fee_asset":"USDT",
        //                 "client_order_id":null,
        //                 "average_executed_price":28881.41
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'rows');
        return this.parseOrders (data, market, since, limit, params);
    }

    parseOrder (order, market = undefined) {
        //
        // Possible input functions:
        // * createOrder
        // * cancelOrder
        // * fetchOrder
        // * fetchOrders
        // const isFromFetchOrder = ('order_tag' in order); TO_DO
        const timestamp = this.safeTimestamp2 (order, 'timestamp', 'created_time');
        const orderId = this.safeString (order, 'order_id');
        const clientOrderId = this.safeString (order, 'client_order_id'); // Somehow, this always returns 0 for limit order
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString2 (order, 'order_price', 'price');
        const amount = this.safeString2 (order, 'order_quantity', 'quantity'); // This is base amount
        const cost = this.safeString2 (order, 'order_amount', 'amount'); // This is quote amount
        const orderType = this.safeStringLower2 (order, 'order_type', 'type');
        const status = this.safeValue (order, 'status');
        const side = this.safeStringLower (order, 'side');
        const filled = this.safeValue (order, 'executed');
        const remaining = Precise.stringSub (cost, filled);
        const fee = this.safeValue (order, 'total_fee');
        const feeCurrency = this.safeString (order, 'fee_asset');
        const transactions = this.safeValue (order, 'Transactions');
        return this.safeOrder ({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseOrderStatus (status),
            'symbol': symbol,
            'type': orderType,
            'timeInForce': undefined,
            'postOnly': undefined, // TO_DO
            'reduceOnly': this.safeValue (order, 'reduce_only'),
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining, // TO_DO
            'cost': cost,
            'trades': transactions,
            'fee': {
                'cost': fee,
                'currency': feeCurrency,
            },
            'info': order,
        }, market);
    }

    parseOrderStatus (status) {
        if (status !== undefined) {
            const statuses = {
                'NEW': 'open',
                'FILLED': 'closed',
                'CANCEL_SENT': 'canceled',
                'CANCEL_ALL_SENT': 'canceled',
                'CANCELLED': 'canceled',
                'PARTIAL_FILLED': 'open',
                'REJECTED': 'rejected',
                'INCOMPLETE': 'open',
                'COMPLETED': 'closed',
            };
            return this.safeString (statuses, status, status);
        }
        return status;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            limit = Math.min (limit, 1000);
            request['max_level'] = limit;
        }
        const response = await this.v1PrivateGetOrderbookSymbol (this.extend (request, params));
        //
        // {
        //   success: true,
        //   timestamp: '1641562961192',
        //   asks: [
        //     { price: '0.921', quantity: '76.01' },
        //     { price: '0.933', quantity: '477.10' },
        //     ...
        //   ],
        //   bids: [
        //     { price: '0.940', quantity: '13502.47' },
        //     { price: '0.932', quantity: '43.91' },
        //     ...
        //   ]
        // }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        const response = await this.v1PrivateGetKline (this.extend (request, params));
        // {
        //     success: true,
        //     rows: [
        //       {
        //         open: '0.94238',
        //         close: '0.94271',
        //         low: '0.94238',
        //         high: '0.94296',
        //         volume: '73.55',
        //         amount: '69.32040520',
        //         symbol: 'SPOT_WOO_USDT',
        //         type: '1m',
        //         start_timestamp: '1641584700000',
        //         end_timestamp: '1641584760000'
        //       },
        //       {
        //         open: '0.94186',
        //         close: '0.94186',
        //         low: '0.94186',
        //         high: '0.94186',
        //         volume: '64.00',
        //         amount: '60.27904000',
        //         symbol: 'SPOT_WOO_USDT',
        //         type: '1m',
        //         start_timestamp: '1641584640000',
        //         end_timestamp: '1641584700000'
        //       },
        //       ...
        //     ]
        // }
        const data = this.safeValue (response, 'rows', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        // example response in fetchOHLCV
        return [
            this.safeInteger (ohlcv, 'start_timestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'oid': id,
        };
        const response = await this.v1PrivateGetOrderOidTrades (this.extend (request, params));
        // {
        //     success: true,
        //     rows: [
        //       {
        //         id: '99111647',
        //         symbol: 'SPOT_WOO_USDT',
        //         fee: '0.0024',
        //         side: 'BUY',
        //         executed_timestamp: '1641482113.084',
        //         order_id: '87541111',
        //         order_tag: 'default',
        //         executed_price: '1',
        //         executed_quantity: '12',
        //         fee_asset: 'WOO',
        //         is_maker: '1'
        //       }
        //     ]
        // }
        const trades = this.safeValue (response, 'rows', []);
        return this.parseTrades (trades, market, since, limit, params);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        const response = await this.v1PrivateGetClientTrades (this.extend (request, params));
        // {
        //     "success": true,
        //     "meta": {
        //         "records_per_page": 25,
        //         "current_page": 1
        //     },
        //     "rows": [
        //         {
        //             "id": 5,
        //             "symbol": "SPOT_BTC_USDT",
        //             "order_id": 211,
        //             "order_tag": "default",
        //             "executed_price": 10892.84,
        //             "executed_quantity": 0.002,
        //             "is_maker": 0,
        //             "side": "SELL",
        //             "fee": 0,
        //             "fee_asset": "USDT",
        //             "executed_timestamp": "1566264290.250"
        //         },
        //         ...
        //     ]
        // }
        const trades = this.safeValue (response, 'rows', []);
        return this.parseTrades (trades, market, since, limit, params);
    }

    async fetchAccounts (params = {}) {
        /**
         * @method
         * @name woo#fetchAccounts
         * @description fetch all the accounts associated with a profile
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/en/latest/manual.html#account-structure} indexed by the account type
         */
        const response = await this.v1PrivateGetSubAccountAssets (params);
        //
        //     {
        //         rows: [{
        //                 application_id: '13e4fc34-e2ff-4cb7-b1e4-4c22fee7d365',
        //                 account: 'Main',
        //                 usdt_balance: '4.0'
        //             },
        //             {
        //                 application_id: '432952aa-a401-4e26-aff6-972920aebba3',
        //                 account: 'subaccount',
        //                 usdt_balance: '1.0'
        //             }
        //         ],
        //         success: true
        //     }
        //
        const rows = this.safeValue (response, 'rows', []);
        return this.parseAccounts (rows, params);
    }

    parseAccount (account) {
        //
        //     {
        //         application_id: '336952aa-a401-4e26-aff6-972920aebba3',
        //         account: 'subaccount',
        //         usdt_balance: '1.0',
        //     }
        //
        const accountId = this.safeString (account, 'account');
        return {
            'info': account,
            'id': this.safeString (account, 'application_id'),
            'name': accountId,
            'code': undefined,
            'type': accountId === 'Main' ? 'main' : 'subaccount',
        };
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name woo#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.v2PrivateGetClientHolding (params);
        //
        // {
        //     holding: [
        //       {
        //         token: 'USDT',
        //         holding: '23.56', // free balance
        //         frozen: '888.0', // i.e. if in processing withdrawal
        //         interest: '0.0',
        //         outstanding_holding: '-56.7', // this value is set (negative number) if there is an open limit order, and this is QUOTE currency of order
        //         pending_exposure: '333.45', //  this value is set  (positive number) if there is an open limit order, and this is BASE currency of order
        //         opening_cost: '0.00000000',
        //         holding_cost: '0.00000000',
        //         realised_pnl: '0.00000000',
        //         settled_pnl: '0.00000000',
        //         fee_24_h: '0',
        //         settled_pnl_24_h: '0',
        //         updated_time: '1641370779'
        //       },
        //       ...
        //     ],
        //     success: true
        // }
        //
        return this.parseBalance (response);
    }

    parseBalance (response) {
        const result = {
            'info': response,
        };
        const balances = this.safeValue (response, 'holding', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'token'));
            const account = this.account ();
            account['total'] = this.safeString (balance, 'holding');
            const used = this.safeString (balance, 'outstanding_holding');
            account['used'] = Precise.stringNeg (used);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name woo#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        // this method is TODO because of networks unification
        await this.loadMarkets ();
        const currency = this.currency (code);
        const networkCodeDefault = this.defaultNetworkCodeForCurrency (code);
        const networkCode = this.safeString (params, 'network', networkCodeDefault);
        params = this.omit (params, 'network');
        const codeForExchange = networkCode + '_' + currency['code'];
        const request = {
            'token': codeForExchange,
        };
        const response = await this.v1PrivateGetAssetDeposit (this.extend (request, params));
        // {
        //     success: true,
        //     address: '3Jmtjx5544T4smrit9Eroe4PCrRkpDeKjP',
        //     extra: ''
        // }
        const tag = this.safeString (response, 'extra');
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': networkCode,
            'info': response,
        };
    }

    async getAssetHistoryRows (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = { };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['balance_token'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const transactionType = this.safeString (params, 'type');
        params = this.omit (params, 'type');
        if (transactionType !== undefined) {
            request['type'] = transactionType;
        }
        const response = await this.v1PrivateGetAssetHistory (this.extend (request, params));
        // {
        //     rows: [
        //       {
        //         id: '22010508193900165',
        //         token: 'TRON_USDT',
        //         extra: '',
        //         amount: '13.75848500',
        //         status: 'COMPLETED',
        //         account: null,
        //         description: null,
        //         user_id: '42222',
        //         application_id: '6ad2b303-f354-45c0-8105-9f5f19d0e335',
        //         external_id: '220105081900134',
        //         target_address: 'TXnyFSnAYad3YCaqtwMw9jvXKkeU39NLnK',
        //         source_address: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6',
        //         type: 'BALANCE',
        //         token_side: 'DEPOSIT',
        //         tx_id: '35b0004022f6b3ad07f39a0b7af199f6b258c2c3e2c7cdc93c67efa74fd625ee',
        //         fee_token: '',
        //         fee_amount: '0.00000000',
        //         created_time: '1641370779.442',
        //         updated_time: '1641370779.465',
        //         is_new_target_address: null,
        //         confirmed_number: '29',
        //         confirming_threshold: '27',
        //         audit_tag: '1',
        //         audit_result: '0',
        //         balance_token: null, // TODO -write to support, that this seems broken. here should be the token id
        //         network_name: null // TODO -write to support, that this seems broken. here should be the network id
        //       }
        //     ],
        //     meta: { total: '1', records_per_page: '25', current_page: '1' },
        //     success: true
        // }
        return [ currency, this.safeValue (response, 'rows', {}) ];
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
        const [ currency, rows ] = await this.getAssetHistoryRows (code, since, limit, params);
        return this.parseLedger (rows, currency, since, limit, params);
    }

    parseLedgerEntry (item, currency = undefined) {
        const networkizedCode = this.safeString (item, 'token');
        const currencyDefined = this.getCurrencyFromChaincode (networkizedCode, currency);
        const code = currencyDefined['code'];
        const amount = this.safeNumber (item, 'amount');
        const side = this.safeString (item, 'token_side');
        const direction = (side === 'DEPOSIT') ? 'in' : 'out';
        const timestamp = this.safeTimestamp (item, 'created_time');
        const fee = this.parseTokenAndFeeTemp (item, 'fee_token', 'fee_amount');
        return {
            'id': this.safeString (item, 'id'),
            'currency': code,
            'account': this.safeString (item, 'account'),
            'referenceAccount': undefined,
            'referenceId': this.safeString (item, 'tx_id'),
            'status': this.parseTransactionStatus (this.safeString (item, 'status')),
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'fee': fee,
            'direction': direction,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'type': this.parseLedgerEntryType (this.safeString (item, 'type')),
            'info': item,
        };
    }

    parseLedgerEntryType (type) {
        const types = {
            'BALANCE': 'transaction', // Funds moved in/out wallet
            'COLLATERAL': 'transfer', // Funds moved between portfolios
        };
        return this.safeString (types, type, type);
    }

    getCurrencyFromChaincode (networkizedCode, currency) {
        if (currency !== undefined) {
            return currency;
        } else {
            const parts = networkizedCode.split ('_');
            const partsLength = parts.length;
            const firstPart = this.safeString (parts, 0);
            let currencyId = this.safeString (parts, 1, firstPart);
            if (partsLength > 2) {
                currencyId += '_' + this.safeString (parts, 2);
            }
            currency = this.safeCurrency (currencyId);
        }
        return currency;
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        const request = {
            'token_side': 'DEPOSIT',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        const request = {
            'token_side': 'WITHDRAW',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchTransactions
         * @description fetch history of deposits and withdrawals
         * @param {string|undefined} code unified currency code for the currency of the transactions, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest transaction, default is undefined
         * @param {int|undefined} limit max number of transactions to return, default is undefined
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        const request = {
            'type': 'BALANCE',
        };
        const [ currency, rows ] = await this.getAssetHistoryRows (code, since, limit, this.extend (request, params));
        //
        //     {
        //         "rows":[],
        //         "meta":{
        //             "total":0,
        //             "records_per_page":25,
        //             "current_page":1
        //         },
        //         "success":true
        //     }
        //
        return this.parseTransactions (rows, currency, since, limit, params);
    }

    parseTransaction (transaction, currency = undefined) {
        // example in fetchLedger
        const networkizedCode = this.safeString (transaction, 'token');
        const currencyDefined = this.getCurrencyFromChaincode (networkizedCode, currency);
        const code = currencyDefined['code'];
        let movementDirection = this.safeStringLower (transaction, 'token_side');
        if (movementDirection === 'withdraw') {
            movementDirection = 'withdrawal';
        }
        const fee = this.parseTokenAndFeeTemp (transaction, 'fee_token', 'fee_amount');
        fee['rate'] = undefined;
        const addressTo = this.safeString (transaction, 'target_address');
        const addressFrom = this.safeString (transaction, 'source_address');
        const timestamp = this.safeTimestamp (transaction, 'created_time');
        return {
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'tx_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'tag': this.safeString (transaction, 'extra'),
            'type': movementDirection,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'updated': this.safeTimestamp (transaction, 'updated_time'),
            'fee': fee,
            'info': transaction,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'NEW': 'pending',
            'CONFIRMING': 'pending',
            'PROCESSING': 'pending',
            'COMPLETED': 'ok',
            'CANCELED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name woo#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'token': currency['id'],
            'amount': this.parseNumber (amount),
            'from_application_id': fromAccount,
            'to_application_id': toAccount,
        };
        const response = await this.v1PrivatePostAssetMainSubTransfer (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "id": 200
        //     }
        //
        const transfer = this.parseTransfer (response, currency);
        const transferOptions = this.safeValue (this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeValue (transferOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            transfer['amount'] = amount;
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
        }
        return transfer;
    }

    async fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @param {string|undefined} code unified currency code of the currency transferred
         * @param {int|undefined} since the earliest time in ms to fetch transfers for
         * @param {int|undefined} limit the maximum number of  transfers structures to retrieve
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {[object]} a list of [transfer structures]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        const request = {
            'type': 'COLLATERAL',
        };
        const [ currency, rows ] = await this.getAssetHistoryRows (code, since, limit, this.extend (request, params));
        return this.parseTransfers (rows, currency, since, limit, params);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //    getAssetHistoryRows
        //        {
        //            "created_time": "1579399877.041",  // Unix epoch time in seconds
        //            "updated_time": "1579399877.041",  // Unix epoch time in seconds
        //            "id": "202029292829292",
        //            "external_id": "202029292829292",
        //            "application_id": null,
        //            "token": "ETH",
        //            "target_address": "0x31d64B3230f8baDD91dE1710A65DF536aF8f7cDa",
        //            "source_address": "0x70fd25717f769c7f9a46b319f0f9103c0d887af0",
        //            "extra": "",
        //            "type": "BALANCE",
        //            "token_side": "DEPOSIT",
        //            "amount": 1000,
        //            "tx_id": "0x8a74c517bc104c8ebad0c3c3f64b1f302ed5f8bca598ae4459c63419038106b6",
        //            "fee_token": null,
        //            "fee_amount": null,
        //            "status": "CONFIRMING"
        //        }
        //
        //    v1PrivatePostAssetMainSubTransfer
        //        {
        //            "success": true,
        //            "id": 200
        //        }
        //
        const networkizedCode = this.safeString (transfer, 'token');
        const currencyDefined = this.getCurrencyFromChaincode (networkizedCode, currency);
        const code = currencyDefined['code'];
        let movementDirection = this.safeStringLower (transfer, 'token_side');
        if (movementDirection === 'withdraw') {
            movementDirection = 'withdrawal';
        }
        let fromAccount = undefined;
        let toAccount = undefined;
        if (movementDirection === 'withdraw') {
            fromAccount = undefined;
            toAccount = 'spot';
        } else if (movementDirection === 'deposit') {
            fromAccount = 'spot';
            toAccount = undefined;
        }
        const timestamp = this.safeTimestamp (transfer, 'created_time');
        const success = this.safeValue (transfer, 'success');
        let status = undefined;
        if (success !== undefined) {
            status = success ? 'ok' : 'failed';
        }
        return {
            'id': this.safeString (transfer, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.parseTransferStatus (this.safeString (transfer, 'status', status)),
            'info': transfer,
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            'NEW': 'pending',
            'CONFIRMING': 'pending',
            'PROCESSING': 'pending',
            'COMPLETED': 'ok',
            'CANCELED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    async repayMargin (code, amount, symbol = undefined, params = {}) {
        /**
         * @method
         * @name woo#repayMargin
         * @description repay borrowed margin and interest
         * @see https://docs.woo.org/#repay-interest
         * @param {string} code unified currency code of the currency to repay
         * @param {float} amount the amount to repay
         * @param {string|undefined} symbol not used by woo.repayMargin ()
         * @param {object} params extra parameters specific to the woo api endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/en/latest/manual.html#margin-loan-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        const currency = this.currency (code);
        const request = {
            'token': currency['id'], // interest token that you want to repay
            'amount': this.currencyToPrecision (code, amount),
        };
        const response = await this.v1PrivatePostInterestRepay (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //     }
        //
        const transaction = this.parseMarginLoan (response, currency);
        return this.extend (transaction, {
            'amount': amount,
            'symbol': symbol,
        });
    }

    parseMarginLoan (info, currency = undefined) {
        //
        //     {
        //         "success": true,
        //     }
        //
        return {
            'id': undefined,
            'currency': this.safeCurrencyCode (undefined, currency),
            'amount': undefined,
            'symbol': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, section = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = section[0];
        const access = section[1];
        let url = this.implodeHostname (this.urls['api'][access]);
        url += '/' + version + '/';
        path = this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        params = this.keysort (params);
        if (access === 'public') {
            url += access + '/' + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            url += path;
            const ts = this.nonce ().toString ();
            let auth = this.urlencode (params);
            if (method === 'POST' || method === 'DELETE') {
                body = auth;
            } else {
                url += '?' + auth;
            }
            auth += '|' + ts;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            headers = {
                'x-api-key': this.apiKey,
                'x-api-signature': signature,
                'x-api-timestamp': ts,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to default error handler
        }
        //
        //     400 Bad Request {"success":false,"code":-1012,"message":"Amount is required for buy market orders when margin disabled."}
        //
        const success = this.safeValue (response, 'success');
        const errorCode = this.safeString (response, 'code');
        if (!success) {
            const feedback = this.id + ' ' + this.json (response);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
    }

    parseIncome (income, market = undefined) {
        //
        //     {
        //         "id":666666,
        //         "symbol":"PERP_BTC_USDT",
        //         "funding_rate":0.00001198,
        //         "mark_price":28941.04000000,
        //         "funding_fee":0.00069343,
        //         "payment_type":"Pay",
        //         "status":"COMPLETED",
        //         "created_time":"1653616000.666",
        //         "updated_time":"1653616000.605"
        //     }
        //
        const marketId = this.safeString (income, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const amount = this.safeNumber (income, 'funding_fee');
        const code = this.safeCurrencyCode ('USD');
        const id = this.safeString (income, 'id');
        const timestamp = this.safeTimestamp (income, 'updated_time');
        const rate = this.safe_number (income, 'funding_rate');
        return {
            'info': income,
            'symbol': symbol,
            'code': code,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': id,
            'amount': amount,
            'rate': rate,
        };
    }

    parseIncomes (incomes, market = undefined, since = undefined, limit = undefined) {
        const result = [];
        for (let i = 0; i < incomes.length; i++) {
            const entry = incomes[i];
            const parsed = this.parseIncome (entry, market);
            result.push (parsed);
        }
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterBySinceLimit (sorted, since, limit, 'timestamp');
    }

    async fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        const response = await this.v1PrivateGetFundingFeeHistory (this.extend (request, params));
        //
        //     {
        //         "rows":[
        //             {
        //                 "id":666666,
        //                 "symbol":"PERP_BTC_USDT",
        //                 "funding_rate":0.00001198,
        //                 "mark_price":28941.04000000,
        //                 "funding_fee":0.00069343,
        //                 "payment_type":"Pay",
        //                 "status":"COMPLETED",
        //                 "created_time":"1653616000.666",
        //                 "updated_time":"1653616000.605"
        //             }
        //         ],
        //         "meta":{
        //             "total":235,
        //             "records_per_page":25,
        //             "current_page":1
        //         },
        //         "success":true
        //     }
        //
        const result = this.safeValue (response, 'rows', []);
        return this.parseIncomes (result, market, since, limit);
    }

    parseFundingRate (fundingRate, market = undefined) {
        //
        //         {
        //             "symbol":"PERP_AAVE_USDT",
        //             "est_funding_rate":-0.00003447,
        //             "est_funding_rate_timestamp":1653633959001,
        //             "last_funding_rate":-0.00002094,
        //             "last_funding_rate_timestamp":1653631200000,
        //             "next_funding_time":1653634800000
        //         }
        //
        //
        const symbol = this.safeString (fundingRate, 'symbol');
        market = this.market (symbol);
        const nextFundingTimestamp = this.safeInteger (fundingRate, 'next_funding_time');
        const estFundingRateTimestamp = this.safeInteger (fundingRate, 'est_funding_rate_timestamp');
        const lastFundingRateTimestamp = this.safeInteger (fundingRate, 'last_funding_rate_timestamp');
        return {
            'info': fundingRate,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': this.parseNumber ('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': estFundingRateTimestamp,
            'datetime': this.iso8601 (estFundingRateTimestamp),
            'fundingRate': this.safeNumber (fundingRate, 'est_funding_rate'),
            'fundingTimestamp': nextFundingTimestamp,
            'fundingDatetime': this.iso8601 (nextFundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': this.safeNumber (fundingRate, 'last_funding_rate'),
            'previousFundingTimestamp': lastFundingRateTimestamp,
            'previousFundingDatetime': this.iso8601 (lastFundingRateTimestamp),
        };
    }

    async fetchFundingRate (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PublicGetFundingRateSymbol (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "timestamp":1653640572711,
        //         "symbol":"PERP_BTC_USDT",
        //         "est_funding_rate":0.00000738,
        //         "est_funding_rate_timestamp":1653640559003,
        //         "last_funding_rate":0.00000629,
        //         "last_funding_rate_timestamp":1653638400000,
        //         "next_funding_time":1653642000000
        //     }
        //
        return this.parseFundingRate (response, market);
    }

    async fetchFundingRates (symbols, params = {}) {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.v1PublicGetFundingRates (params);
        //
        //     {
        //         "success":true,
        //         "rows":[
        //             {
        //                 "symbol":"PERP_AAVE_USDT",
        //                 "est_funding_rate":-0.00003447,
        //                 "est_funding_rate_timestamp":1653633959001,
        //                 "last_funding_rate":-0.00002094,
        //                 "last_funding_rate_timestamp":1653631200000,
        //                 "next_funding_time":1653634800000
        //             }
        //         ],
        //         "timestamp":1653633985646
        //     }
        //
        const rows = this.safeValue (response, 'rows', {});
        const result = this.parseFundingRates (rows);
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_t'] = parseInt (since / 1000);
        }
        const response = await this.v1PublicGetFundingRateHistory (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "meta":{
        //             "total":2464,
        //             "records_per_page":25,
        //             "current_page":1
        //         },
        //         "rows":[
        //             {
        //                 "symbol":"PERP_BTC_USDT",
        //                 "funding_rate":0.00000629,
        //                 "funding_rate_timestamp":1653638400000,
        //                 "next_funding_time":1653642000000
        //             }
        //         ],
        //         "timestamp":1653640814885
        //     }
        //
        const result = this.safeValue (response, 'rows');
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString (entry, 'symbol');
            const timestamp = this.safeInteger (entry, 'funding_rate_timestamp');
            rates.push ({
                'info': entry,
                'symbol': this.safeSymbol (marketId),
                'fundingRate': this.safeNumber (entry, 'funding_rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    async fetchLeverage (symbol, params = {}) {
        await this.loadMarkets ();
        const response = await this.v1PrivateGetClientInfo (params);
        //
        //     {
        //         "success": true,
        //         "application": {
        //             "application_id": "8935820a-6600-4c2c-9bc3-f017d89aa173",
        //             "account": "CLIENT_ACCOUNT_01",
        //             "alias": "CLIENT_ACCOUNT_01",
        //             "account_mode":"FUTURES" //account mode
        //             "leverage": 5,
        //             "taker_fee_rate": 0,
        //             "maker_fee_rate": 0,
        //             "interest_rate": 0,
        //             "futures_leverage": 5,
        //             "futures_taker_fee_rate": 0,
        //             "futures_maker_fee_rate": 0,
        //             "otpauth": false
        //         },
        //         "margin_rate": 1000
        //     }
        //
        const result = this.safeValue (response, 'application');
        const leverage = this.safeNumber (result, 'leverage');
        return {
            'info': response,
            'leverage': leverage,
        };
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if ((leverage < 1) || (leverage > 20)) {
            throw new BadRequest (this.id + ' leverage should be between 1 and 20');
        }
        const request = {
            'leverage': leverage,
        };
        return await this.v1PrivatePostClientLeverage (this.extend (request, params));
    }

    async fetchPosition (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PrivateGetPositionSymbol (this.extend (request, params));
        //
        //     {
        //         "symbol":"PERP_ETC_USDT",
        //         "holding":0.0,
        //         "pnl_24_h":0,
        //         "settle_price":0.0,
        //         "average_open_price":0,
        //         "success":true,
        //         "mark_price":22.6955,
        //         "pending_short_qty":0.0,
        //         "pending_long_qty":0.0,
        //         "fee_24_h":0,
        //         "timestamp":"1652231044.920"
        //     }
        //
        return this.parsePosition (response, market);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.v1PrivateGetPositions (params);
        //
        //     {
        //         "positions":[
        //             {
        //                 "symbol":"PERP_ETC_USDT",
        //                 "holding":0.0,
        //                 "pending_long_qty":0.0,
        //                 "pending_short_qty":0.0,
        //                 "settle_price":0.0,
        //                 "average_open_price":0,
        //                 "timestamp":"1652231044.920",
        //                 "mark_price":22.68,
        //                 "pnl_24_h":0,
        //                 "fee_24_h":0
        //             }
        //         ],
        //         "initial_margin_ratio":1000,
        //         "current_margin_ratio":1000,
        //         "maintenance_margin_ratio":1000,
        //         "success":true
        //     }
        //
        const result = this.safeValue (response, 'positions', []);
        return this.parsePositions (result, symbols);
    }

    parsePosition (position, market = undefined) {
        //
        //     {
        //         "symbol":"PERP_ETC_USDT",
        //         "holding":0.0,
        //         "pending_long_qty":0.0,
        //         "pending_short_qty":0.0,
        //         "settle_price":0.0,
        //         "average_open_price":0,
        //         "timestamp":"1652231044.920",
        //         "mark_price":22.68,
        //         "pnl_24_h":0,
        //         "fee_24_h":0
        //     }
        //
        const contract = this.safeString (position, 'symbol');
        market = this.safeMarket (contract, market);
        let size = this.safeString (position, 'holding');
        let side = undefined;
        if (Precise.stringGt (size, '0')) {
            side = 'long';
        } else {
            side = 'short';
        }
        const contractSize = this.safeString (market, 'contractSize');
        const markPrice = this.safeString (position, 'mark_price');
        const timestamp = this.safeTimestamp (position, 'timestamp');
        const entryPrice = this.safeString (position, 'average_open_price');
        const priceDifference = Precise.stringSub (markPrice, entryPrice);
        const unrealisedPnl = Precise.stringMul (priceDifference, size);
        size = Precise.stringAbs (size);
        const notional = Precise.stringMul (size, markPrice);
        return {
            'info': position,
            'id': undefined,
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.parseNumber (entryPrice),
            'notional': this.parseNumber (notional),
            'leverage': undefined,
            'unrealizedPnl': this.parseNumber (unrealisedPnl),
            'contracts': this.parseNumber (size),
            'contractSize': this.parseNumber (contractSize),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber (position, 'est_liq_price'),
            'markPrice': this.parseNumber (markPrice),
            'collateral': undefined,
            'marginMode': 'cross',
            'marginType': undefined,
            'side': side,
            'percentage': undefined,
        };
    }

    defaultNetworkCodeForCurrency (code) { // TODO: can be moved into base as an unified method
        const currencyItem = this.currency (code);
        const networks = currencyItem['networks'];
        const networkKeys = Object.keys (networks);
        for (let i = 0; i < networkKeys.length; i++) {
            const network = networkKeys[i];
            if (network === 'ETH') {
                return network;
            }
        }
        // if it was not returned according to above options, then return the first network of currency
        return this.safeValue (networkKeys, 0);
    }
};
