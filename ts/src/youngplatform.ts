
//  ---------------------------------------------------------------------------

import Exchange from './abstract/youngplatform.js';
import { ExchangeError, InvalidOrder, AuthenticationError, PermissionDenied, BadRequest } from './base/errors.js';
import { Precise } from './base/Precise.js';
import type { Int, Balances, Trade, Ticker, OrderBook, Market } from './base/types.js';
import { DECIMAL_PLACES } from './base/functions/number.js';

//  ---------------------------------------------------------------------------

/**
 * @class youngplatform
 * @augments Exchange
 */
export default class youngplatform extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'youngplatform',
            'name': 'Young Platform',
            'countries': [ 'IT', 'FR' ], // Japan, Malta
            'rateLimit': 50,
            'certified': false,
            'pro': true,
            // new metainfo2 interface
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,  // contract only
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createOrder': true,
                'createOrders': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': false,
                'fetchAccounts': undefined,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrder': true,
                'fetchClosedOrders': 'emulated',
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': undefined,
                'fetchTransactionFee': undefined,
                'fetchTransactionFees': false,
                'fetchTransactions': true,
                'fetchTransfers': false,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'test': {
                    'rest': 'https://testbff.youngplatform.com/api/v4',
                },
                'api': {
                    'rest': 'https://bff.youngplatform.com/api/v4',
                },
                'www': 'https://youngplatform.com/',
                'referral': {
                    'url': 'https://exchange.youngplatform.com/signup/?utm_source=website&utm_medium=menu&utm_campaign=homepageDesktop&ref=1311738',
                    'discount': 0.1,
                },
                'doc': [
                    'https://youngplatform.stoplight.io/docs/bff/5jyiu57dlv9e7-authentication',
                ],
                'api_management': 'https://youngplatform.stoplight.io/docs/bff/5jyiu57dlv9e7-authentication',
                'fees': 'https://exchange.youngplatform.com/fees',
            },
            'api': {
                'v4': {
                    'public': {
                        'get': [
                            'ping',
                            'status',
                            'time',
                            'currencies',
                            'markets',
                            'ticker',
                            'trades',
                            'orderbook',
                            'charts',
                            'charts/{pair}',
                        ],
                    },
                    'private': {
                        'get': [
                            'transactions',
                            'balances',
                            'keys',
                            'sessions',
                            'profile',
                        ],
                        'post': [
                            'keys',
                            'orders',
                        ],
                        'delete': [
                            'keys/{id}',
                        ],
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0.001'),
                },
            },
            'commonCurrencies': {
                'BCC': 'BCC',
            },
            'precisionMode': DECIMAL_PLACES,
            'options': {
                'networks': {
                    'ERC20': 'ETH',
                    'BEP20': 'BSC',
                },
            },
            'exceptions': {
                'exact': {
                    'ERR_BAD_REQUEST': BadRequest,
                    'ERR_CURRENCY_NOT_FOUND': BadRequest,
                    'ERR_DYNAMIC_LINK_CREATION_FAILED': ExchangeError,
                    'ERR_CUSTOMER_NOT_FOUND': BadRequest,
                    'ERR_BLACKLISTED_ADDRESS': BadRequest,
                    'ERR_WITHDRAW_FAILED': ExchangeError,
                    'ERR_INVALID_2FA_CODE': AuthenticationError,
                    'ERR_INVALID_TOKEN': AuthenticationError,
                    'ERR_TOKEN_NOT_FOUND': AuthenticationError,
                    'ERR_TOKEN_EXAUSTED': AuthenticationError,
                    'ERR_KYC_NOT_APPROVED': AuthenticationError,
                    'ERR_INVALID_CURRENCY': BadRequest,
                    'ERR_MIN_TRANSFER_AMOUNT': BadRequest,
                    'ERR_MAX_TRANSFER_AMOUNT': BadRequest,
                    'ERR_IP_NOT_WHITELISTED': AuthenticationError,
                    'ERR_LOCKED_WALLET': ExchangeError,
                    'ERR_DUPLICATE': ExchangeError,
                    'ERR_INSUFFICIENT_BALANCE': BadRequest,
                    'ERR_CARD_DECLINED': ExchangeError,
                    'ERR_FAILED_PAYMENT': ExchangeError,
                    'ERR_CARD_NOT_FOUND': BadRequest,
                    'ERR_PAYMENT_ALREADY_PROCESSED': ExchangeError,
                    'ERR_DECLINED': ExchangeError,
                    'ERR_NOT_FOUND': BadRequest,
                    'ERR_INVALID_EMAIL': ExchangeError,
                    'ERR_PERMISSION': AuthenticationError,
                    'ERR_TX_DISABLED': ExchangeError,
                    'ERR_DISABLED_FEATURE': ExchangeError,
                    'ERR_TRANSACTION_LIMIT': BadRequest,
                    'ERR_MISSING_REQUIREMENT': BadRequest,
                    'ERR_ORDER_FAILED': ExchangeError,
                },
                'broad': {
                    'has no operation privilege': PermissionDenied,
                    'MAX_POSITION': InvalidOrder,
                },
            },
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name youngplatform#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.v4PublicGetTime (params);
        //
        //     {
        //         "time": "2024-01-01T01:01:01Z"
        //     }
        //
        return this.safeTimestamp (response, 'time');
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name youngplatform#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.v4PublicGetCurrencies (params);
        //
        // [
        //     {
        //         "name": "AAVE",
        //         "symbol": "AAVE",
        //         "decimalPrecision": 18,
        //         "price": 59.75,
        //         "priority": 0,
        //         "details":
        //         {
        //             "color": "#a361a4",
        //             "image": "https://images.youngplatform.com/coins/aave_light_3.png",
        //             "imageLight": "https://images.youngplatform.com/coins/aave_light_3.png",
        //             "imageWalletCover": null,
        //             "imageWalletCoverLandscapeMobile": null,
        //             "imageWalletCoverLandscapeDesktop": null,
        //             "maxSupply": 0,
        //             "circulatingSupply": 16000000,
        //             "volume24h": 66377777.09200996,
        //             "marketCap": 1454533970.760525,
        //             "priceChange24h": 2.6188285841196692,
        //             "webSite": "https://aave.com",
        //             "whitePaper": "https://github.com/aave/aave-protocol/blob/master/docs/Aave_Protocol_Whitepaper_v1_0.pdf",
        //             "mineable": false,
        //             "creationDate": "1970-01-01T00:00:00Z"
        //         },
        //         "networks": null,
        //         "tags":
        //         [
        //             {
        //                 "id": 3,
        //                 "label": "platform_pro",
        //                 "description": "pro",
        //                 "priority": 0,
        //                 "isManual": true
        //             },
        //             {
        //                 "id": 4,
        //                 "label": "category",
        //                 "description": "DeFi",
        //                 "priority": 0,
        //                 "isManual": true
        //             }
        //         ],
        //         "descriptions":
        //         {
        //             "en": "Aave is a decentralised financial protocol that allows people to lend and borrow crypto. AAVE has several strengths that make it unique in the DeFi landscape. Its protocol supports around 20 cryptocurrencies, it created the first uncollateralised loans known as \"flash loans.\" It allows users to choose between fixed and variable interest rates.",
        //             "fr": "L'Aave est un protocole financier décentralisé qui permet aux particuliers de prêter et d'emprunter des cryptomonnaies. L'AAVE présente plusieurs atouts qui le rendent unique dans le paysage DeFi. Son protocole propose une vingtaine de cryptomonnaies, il a inventé les « prêts flash » sans garantie, et il permet de choisir entre des taux d'intérêt fixes et variables.",
        //             "it": "Aave è un protocollo finanziario decentralizzato che permette alle persone di prestare e prendere in prestito crypto. AAVE ha diversi punti di forza che la rendono unica nel panorama DeFi. Offre circa 20 criptovalute, ha inventato i “prestiti flash” e consente di alternare tassi di interesse fissi e variabili."
        //         }
        //     }
        // ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const name = this.safeString (currency, 'name');
            const code = this.safeCurrencyCode (id);
            const networks = this.safeValue (currency, 'networks', {});
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': (id === 'EUR' || id === 'USD') ? 'fiat' : 'crypto',
                'name': name,
                'active': true,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': this.safeNumber (currency, 'max_precision'),
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

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name youngplatform#fetchMarkets
         * @description retrieves data on all markets for an exchange
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.v4PublicGetMarkets (params);
        // [
        //     {
        //         "id": 1,
        //         "name": "XRP-EUR",
        //         "base": "XRP",
        //         "quote": "EUR",
        //         "minTradeAmount": 1e-8,
        //         "makerFee": 0.2,
        //         "takerFee": 0.2,
        //         "makerFeeBase": 2.5,
        //         "takerFeeBase": 3.375,
        //         "baseDecimalPrecision": 0,
        //         "quoteDecimalPrecision": 0,
        //         "minTickSize": 0.00001,
        //         "minOrderValue": 9.9,
        //         "active": true,
        //         "activeMarginTrading": false,
        //         "visible": true,
        //         "fixedFeeTiers": []
        //     }
        // ]
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const marketType = 'spot';
            const tradingDisabled = this.safeValue (market, 'visible');
            result[i] = ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': marketType,
                'spot': (marketType === 'spot'),
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'active': !tradingDisabled,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.safeNumber (market, 'takerFeeBase'),
                'maker': this.safeNumber (market, 'makerFee'),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'minTickSize'),
                    'price': this.safeNumber (market, 'minTickSize'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minTradeAmount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minOrderValue'),
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': market,
            });
        }
        return result;
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name youngplatform#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.v4PublicGetTicker (params);
        // {
        //     "pair": "ETH-EUR",
        //     "open": 3357.73,
        //     "high": 3416.4,
        //     "low": 3130.87,
        //     "close": 3223.1,
        //     "bid": 0,
        //     "ask": 0,
        //     "percentChange": -4.00955407,
        //     "baseVolume": 604346.84676924,
        //     "quoteVolume": 183.49,
        //     "baseVolume24h": 0,
        //     "quoteVolume24h": 0,
        //     "timestamp": 1707144193779
        // }
        const bid = this.safeNumber (response, 'bid');
        const ask = this.safeNumber (response, 'ask');
        const bidVolume = this.safeNumber (response, 'baseVolume');
        const askVolume = this.safeNumber (response, 'quoteVolume');
        const marketId = this.safeString (response, 'pair');
        const last = this.safeNumber (response, 'close');
        const timestamp = this.safeNumber (response, 'timestamp');
        const timestampString = this.numberToString (timestamp);
        return ({
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': timestampString,
            'datetime': timestampString,
            'bid': bid,
            'ask': ask,
            'last': last,
            'high': undefined,
            'low': undefined,
            'bidVolume': bidVolume,
            'askVolume': askVolume,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeNumber (response, 'price_percentage_change_24h'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': response,
        });
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name youngplatform#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified market symbol of the trades
         * @param {int} [since] not used by youngplatform fetchTrades
         * @param {int} [limit] the maximum number of trade structures to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.v4PublicGetTicker (params);
        // [
        //     {
        //       "id": 123456,
        //       "orderId": 789012,
        //       "baseCurrency": "USD",
        //       "quoteCurrency": "BTC",
        //       "side": "Buy",
        //       "taker": true,
        //       "amount": 10.25,
        //       "volume": 0.002,
        //       "rate": 50000.75,
        //       "brokerage": 0.0025,
        //       "brokerageCurrency": "USD",
        //       "executionDate": "2024-02-05T14:30:00"
        //     }
        // ]
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name youngplatform#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.v4PublicGetOrderbook (this.extend (request, params));
        // {
        //     "ticker_id": "BTC-EUR",
        //     "timestamp": "2024-02-14T14:55:40.286Z",
        //     "bids": [
        //         {
        //             "price": "48284.08000000",
        //             "size": "0.00792000"
        //         },
        //         {
        //             "price": "48280.64000000",
        //             "size": "0.00041000"
        //         }
        //     ],
        //     "asks": [
        //         {
        //             "price": "48440.86000000",
        //             "size": "0.01101000"
        //         },
        //         {
        //             "price": "48443.75000000",
        //             "size": "0.00041000"
        //         }
        //     ]
        // }
        const time = this.safeString (response, 'timestamp');
        const timestamp = this.parse8601 (time);
        return this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', 'price', 'size');
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name youngplatform#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.v4PrivateGetBalances (params);
        // [
        //     {
        //       "symbol": "1INCH",
        //       "balance": 0,
        //       "balanceInTrade": 0
        //     },
        //     {
        //       "symbol": "AAVE",
        //       "balance": 0,
        //       "balanceInTrade": 0
        //     },
        //     {
        //       "symbol": "ALGO",
        //       "balance": 0,
        //       "balanceInTrade": 0
        //     }
        // ]
        return this.parseBalance (response);
    }

    // async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
    //     /**
    //      * @method
    //      * @name youngplatform#createOrder
    //      * @description create a trade order
    //      * @param {string} symbol unified symbol of the market to create an order in
    //      * @param {string} type 'market' or 'limit'
    //      * @param {string} side 'buy' or 'sell'
    //      * @param {float} amount how much you want to trade in units of the base currency, quote currency for 'market' 'buy' orders
    //      * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
    //      * @param {object} [params] extra parameters specific to the exchange API endpoint
    //      * @param {float} [params.stopPrice] price to trigger stop orders
    //      * @param {float} [params.triggerPrice] price to trigger stop orders
    //      * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
    //      * @param {float} [params.takeProfitPrice] price to trigger take-profit orders
    //      * @param {bool} [params.postOnly] true or false
    //      * @param {string} [params.timeInForce] 'GTC', 'IOC', 'GTD' or 'PO'
    //      * @param {string} [params.stop_direction] 'UNKNOWN_STOP_DIRECTION', 'STOP_DIRECTION_STOP_UP', 'STOP_DIRECTION_STOP_DOWN' the direction the stopPrice is triggered from
    //      * @param {string} [params.end_time] '2023-05-25T17:01:05.092Z' for 'GTD' orders
    //      * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
    //      * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
    //      */
    //     await this.loadMarkets ();
    //     const market = this.market (symbol);
    //     const request = {
    //         'client_order_id': this.uuid (),
    //         'product_id': market['id'],
    //         'side': side.toUpperCase (),
    //     };
    //     const stopPrice = this.safeNumberN (params, [ 'stopPrice', 'stop_price', 'triggerPrice' ]);
    //     const stopLossPrice = this.safeNumber (params, 'stopLossPrice');
    //     const takeProfitPrice = this.safeNumber (params, 'takeProfitPrice');
    //     const isStop = stopPrice !== undefined;
    //     const isStopLoss = stopLossPrice !== undefined;
    //     const isTakeProfit = takeProfitPrice !== undefined;
    //     const timeInForce = this.safeString (params, 'timeInForce');
    //     const postOnly = (timeInForce === 'PO') ? true : this.safeValue2 (params, 'postOnly', 'post_only', false);
    //     const endTime = this.safeString (params, 'end_time');
    //     let stopDirection = this.safeString (params, 'stop_direction');
    //     if (type === 'limit') {
    //         if (isStop) {
    //             if (stopDirection === undefined) {
    //                 stopDirection = (side === 'buy') ? 'STOP_DIRECTION_STOP_DOWN' : 'STOP_DIRECTION_STOP_UP';
    //             }
    //             if ((timeInForce === 'GTD') || (endTime !== undefined)) {
    //                 if (endTime === undefined) {
    //                     throw new ExchangeError (this.id + ' createOrder() requires an end_time parameter for a GTD order');
    //                 }
    //                 request['order_configuration'] = {
    //                     'stop_limit_stop_limit_gtd': {
    //                         'base_size': this.amountToPrecision (symbol, amount),
    //                         'limit_price': this.priceToPrecision (symbol, price),
    //                         'stop_price': this.priceToPrecision (symbol, stopPrice),
    //                         'stop_direction': stopDirection,
    //                         'end_time': endTime,
    //                     },
    //                 };
    //             } else {
    //                 request['order_configuration'] = {
    //                     'stop_limit_stop_limit_gtc': {
    //                         'base_size': this.amountToPrecision (symbol, amount),
    //                         'limit_price': this.priceToPrecision (symbol, price),
    //                         'stop_price': this.priceToPrecision (symbol, stopPrice),
    //                         'stop_direction': stopDirection,
    //                     },
    //                 };
    //             }
    //         } else if (isStopLoss || isTakeProfit) {
    //             let triggerPrice = undefined;
    //             if (isStopLoss) {
    //                 if (stopDirection === undefined) {
    //                     stopDirection = (side === 'buy') ? 'STOP_DIRECTION_STOP_UP' : 'STOP_DIRECTION_STOP_DOWN';
    //                 }
    //                 triggerPrice = this.priceToPrecision (symbol, stopLossPrice);
    //             } else {
    //                 if (stopDirection === undefined) {
    //                     stopDirection = (side === 'buy') ? 'STOP_DIRECTION_STOP_DOWN' : 'STOP_DIRECTION_STOP_UP';
    //                 }
    //                 triggerPrice = this.priceToPrecision (symbol, takeProfitPrice);
    //             }
    //             request['order_configuration'] = {
    //                 'stop_limit_stop_limit_gtc': {
    //                     'base_size': this.amountToPrecision (symbol, amount),
    //                     'limit_price': this.priceToPrecision (symbol, price),
    //                     'stop_price': triggerPrice,
    //                     'stop_direction': stopDirection,
    //                 },
    //             };
    //         } else {
    //             if ((timeInForce === 'GTD') || (endTime !== undefined)) {
    //                 if (endTime === undefined) {
    //                     throw new ExchangeError (this.id + ' createOrder() requires an end_time parameter for a GTD order');
    //                 }
    //                 request['order_configuration'] = {
    //                     'limit_limit_gtd': {
    //                         'base_size': this.amountToPrecision (symbol, amount),
    //                         'limit_price': this.priceToPrecision (symbol, price),
    //                         'end_time': endTime,
    //                         'post_only': postOnly,
    //                     },
    //                 };
    //             } else {
    //                 request['order_configuration'] = {
    //                     'limit_limit_gtc': {
    //                         'base_size': this.amountToPrecision (symbol, amount),
    //                         'limit_price': this.priceToPrecision (symbol, price),
    //                         'post_only': postOnly,
    //                     },
    //                 };
    //             }
    //         }
    //     } else {
    //         if (isStop || isStopLoss || isTakeProfit) {
    //             throw new NotSupported (this.id + ' createOrder() only stop limit orders are supported');
    //         }
    //         if (side === 'buy') {
    //             let total = undefined;
    //             let createMarketBuyOrderRequiresPrice = true;
    //             [ createMarketBuyOrderRequiresPrice, params ] = this.handleOptionAndParams (params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
    //             const cost = this.safeNumber (params, 'cost');
    //             params = this.omit (params, 'cost');
    //             if (cost !== undefined) {
    //                 total = this.costToPrecision (symbol, cost);
    //             } else if (createMarketBuyOrderRequiresPrice) {
    //                 if (price === undefined) {
    //                     throw new InvalidOrder (this.id + ' createOrder() requires a price argument for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument');
    //                 } else {
    //                     const amountString = this.numberToString (amount);
    //                     const priceString = this.numberToString (price);
    //                     const costRequest = Precise.stringMul (amountString, priceString);
    //                     total = this.costToPrecision (symbol, costRequest);
    //                 }
    //             } else {
    //                 total = this.costToPrecision (symbol, amount);
    //             }
    //             request['order_configuration'] = {
    //                 'market_market_ioc': {
    //                     'quote_size': total,
    //                 },
    //             };
    //         } else {
    //             request['order_configuration'] = {
    //                 'market_market_ioc': {
    //                     'base_size': this.amountToPrecision (symbol, amount),
    //                 },
    //             };
    //         }
    //     }
    //     params = this.omit (params, [ 'timeInForce', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'stopPrice', 'stop_price', 'stopDirection', 'stop_direction', 'clientOrderId', 'postOnly', 'post_only', 'end_time' ]);
    //     const response = await this.v4PrivatePostOrders (this.extend (request, params));
    //     //
    //     // successful order
    //     //
    //     //     {
    //     //         "success": true,
    //     //         "failure_reason": "UNKNOWN_FAILURE_REASON",
    //     //         "order_id": "52cfe5e2-0b29-4c19-a245-a6a773de5030",
    //     //         "success_response": {
    //     //             "order_id": "52cfe5e2-0b29-4c19-a245-a6a773de5030",
    //     //             "product_id": "LTC-BTC",
    //     //             "side": "SELL",
    //     //             "client_order_id": "4d760580-6fca-4094-a70b-ebcca8626288"
    //     //         },
    //     //         "order_configuration": null
    //     //     }
    //     //
    //     // failed order
    //     //
    //     //     {
    //     //         "success": false,
    //     //         "failure_reason": "UNKNOWN_FAILURE_REASON",
    //     //         "order_id": "",
    //     //         "error_response": {
    //     //             "error": "UNSUPPORTED_ORDER_CONFIGURATION",
    //     //             "message": "source is not enabled for trading",
    //     //             "error_details": "",
    //     //             "new_order_failure_reason": "UNSUPPORTED_ORDER_CONFIGURATION"
    //     //         },
    //     //         "order_configuration": {
    //     //             "limit_limit_gtc": {
    //     //                 "base_size": "100",
    //     //                 "limit_price": "40000",
    //     //                 "post_only": false
    //     //             }
    //     //         }
    //     //     }
    //     //
    //     const success = this.safeValue (response, 'success');
    //     if (success !== true) {
    //         const errorResponse = this.safeValue (response, 'error_response');
    //         const errorTitle = this.safeString (errorResponse, 'error');
    //         const errorMessage = this.safeString (errorResponse, 'message');
    //         if (errorResponse !== undefined) {
    //             this.throwExactlyMatchedException (this.exceptions['exact'], errorTitle, errorMessage);
    //             this.throwBroadlyMatchedException (this.exceptions['broad'], errorTitle, errorMessage);
    //             throw new ExchangeError (errorMessage);
    //         }
    //     }
    //     const data = this.safeValue (response, 'success_response', {});
    //     return this.parseOrder (data, market);
    // }

    sign (path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = api[0];
        const signed = api[1] === 'private';
        let fullPath = '/' + version + '/' + api[1] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                fullPath += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api']['rest'] + fullPath;
        if (signed) {
            const authorization = this.safeString (this.headers, 'Authorization');
            if (authorization !== undefined) {
                headers = {
                    'Authorization': authorization,
                    'Content-Type': 'application/json',
                };
            } else if (this.token) {
                headers = {
                    'Authorization': 'Bearer ' + this.token,
                    'Content-Type': 'application/json',
                };
            } else {
                throw new AuthenticationError (this.id + ' endpoint requires `apiKey` credential');
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    parseTrade (trade, market: Market = undefined): Trade {
        // {
        //   "id": 123456,
        //   "orderId": 789012,
        //   "baseCurrency": "USD",
        //   "quoteCurrency": "BTC",
        //   "side": "Buy",
        //   "taker": true,
        //   "amount": 10.25,
        //   "volume": 0.002,
        //   "rate": 50000.75,
        //   "brokerage": 0.0025,
        //   "brokerageCurrency": "USD",
        //   "executionDate": "2024-02-05T14:30:00"
        // }
        const datetime = this.safeString (trade, 'executionDate');
        const side = this.safeStringLower (trade, 'side');
        const taker = this.safeValue (trade, 'taker');
        const base = this.safeString (trade, 'market');
        const quote = this.safeString (trade, 'quote');
        const symbol = base + '/' + quote;
        const price = this.safeNumber (trade, 'rate');
        const amount = this.safeNumber (trade, 'amount');
        const priceString = this.numberToString (price);
        const amountString = this.numberToString (amount);
        const cost = Precise.stringMul (priceString, amountString);
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'order': this.safeString (trade, 'orderId'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': taker ? 'taker' : 'maker',
            'price': priceString,
            'amount': amountString,
            'cost': cost,
            'fee': {
                'cost': undefined,
                'currency': quote,
            },
        });
    }

    parseBalance (response, params = {}) {
        // [
        //     {
        //       "symbol": "1INCH",
        //       "balance": 0,
        //       "balanceInTrade": 0
        //     },
        //     {
        //       "symbol": "AAVE",
        //       "balance": 0,
        //       "balanceInTrade": 0
        //     },
        //     {
        //       "symbol": "ALGO",
        //       "balance": 0,
        //       "balanceInTrade": 0
        //     }
        // ]
        const result = { 'info': response };
        for (let b = 0; b < response.length; b++) {
            const balance = response[b];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const free = this.safeNumber (balance, 'balance');
            const used = this.safeNumber (balance, 'balanceInTrade');
            const freeString = this.numberToString (free);
            const usedString = this.numberToString (used);
            const total = Precise.stringAdd (freeString, usedString);
            let account = this.safeValue (result, code);
            if (account === undefined) {
                account = this.account ();
                account['free'] = free;
                account['used'] = used;
                account['total'] = total;
            } else {
                account['free'] = Precise.stringAdd (account['free'], freeString);
                account['used'] = Precise.stringAdd (account['used'], usedString);
                account['total'] = Precise.stringAdd (account['total'], total);
            }
            result[code] = account;
        }
        return this.safeBalance (result);
    }
}
