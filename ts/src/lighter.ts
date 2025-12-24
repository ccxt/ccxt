//  ---------------------------------------------------------------------------
import Exchange from './abstract/lighter.js';
import { ArgumentsRequired, ExchangeError } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import Precise from './base/Precise.js';
import type { Dict, FundingRate, FundingRates, Int, int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers, OrderType, OrderSide, Num, Order, Balances, Position, Str, TransferEntry, Currency, Currencies } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class lighter
 * @augments Exchange
 */
export default class lighter extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'lighter',
            'name': 'Lighter',
            'countries': [],
            'version': 'v1',
            'rateLimit': 1000, // 60 requests per minute - normal account
            'certified': false,
            'pro': true,
            'dex': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelOrdersForSymbols': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopOrder': false,
                'createTriggerOrder': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchAllGreeks': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': true,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
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
            },
            'hostname': 'zklighter.elliot.ai',
            'urls': {
                'logo': '',
                'api': {
                    'root': 'https://mainnet.{hostname}',
                    'public': 'https://mainnet.{hostname}',
                    'private': 'https://mainnet.{hostname}',
                },
                'test': {
                    'root': 'https://testnet.{hostname}',
                    'public': 'https://testnet.{hostname}',
                    'private': 'https://testnet.{hostname}',
                },
                'www': 'https://lighter.xyz/',
                'doc': 'https://apidocs.lighter.xyz/',
                'fees': 'https://docs.lighter.xyz/perpetual-futures/fees',
                'referral': '',
            },
            'api': {
                'root': {
                    'get': {
                        // root
                        '': 1, // status
                        'info': 1,
                    },
                },
                'public': {
                    'get': {
                        // account
                        'account': 1,
                        'accountsByL1Address': 1,
                        'apikeys': 1,
                        // order
                        'exchangeStats': 1,
                        'assetDetails': 1,
                        'orderBookDetails': 1,
                        'orderBookOrders': 1,
                        'orderBooks': 1,
                        'recentTrades': 1,
                        // transaction
                        'blockTxs': 1,
                        'nextNonce': 1,
                        'tx': 1,
                        'txFromL1TxHash': 1,
                        'txs': 1,
                        // announcement
                        'announcement': 1,
                        // block
                        'block': 1,
                        'blocks': 1,
                        'currentHeight': 1,
                        // candlestick
                        'candlesticks': 1,
                        'fundings': 1,
                        // bridge
                        'fastbridge/info': 1,
                        // funding
                        'funding-rates': 1,
                        // info
                        'withdrawalDelay': 1,
                    },
                    'post': {
                        // transaction
                        'sendTx': 1,
                        'sendTxBatch': 1,
                    },
                },
                'private': {
                    'get': {
                        // account
                        'accountLimits': 1,
                        'accountMetadata': 1,
                        'pnl': 1,
                        'l1Metadata': 1,
                        'liquidations': 1,
                        'positionFunding': 1,
                        'publicPoolsMetadata': 1,
                        // order
                        'accountActiveOrders': 1,
                        'accountInactiveOrders': 1,
                        'export': 1,
                        'trades': 1,
                        // transaction
                        'accountTxs': 1,
                        'deposit/history': 1,
                        'transfer/history': 1,
                        'withdraw/history': 1,
                        // referral
                        'referral/points': 1,
                        // info
                        'transferFeeInfo': 1,
                    },
                    'post': {
                        // account
                        'changeAccountTier': 1,
                        // notification
                        'notification/ack': 1,
                    },
                },
            },
            'httpExceptions': {
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'fees': {
                'taker': 0,
                'maker': 0,
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'walletAddress': false,
                'privateKey': false,
                'password': false,
                'apiKeyIndex': true,
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {},
            'options': {
                'defaultType': 'swap',
            },
        });
    }

    loadAccount (chainId, privateKey, apiKeyIndex, accountIndex, params = {}) {
        let signer = this.safeDict (this.options, 'signer');
        if (signer !== undefined) {
            return signer;
        }
        let libraryPath = undefined;
        [ libraryPath, params ] = this.handleOptionAndParams (params, 'test', 'libraryPath');
        if (libraryPath === undefined) {
            throw new ArgumentsRequired (this.id + ' required libraryPath in options');
        }
        signer = this.loadLighterLibrary (libraryPath, chainId, privateKey, apiKeyIndex, accountIndex);
        this.options['signer'] = signer;
        return signer;
    }

    createAuth (params = {}) {
        const privateKey = this.privateKey;
        // don't omit [accountIndex, apiKeyIndex], request may need them
        let apiKeyIndex = this.safeInteger2 (params, 'apiKeyIndex', 'api_key_index');
        if (apiKeyIndex === undefined) {
            const res = this.handleOptionAndParams2 ({}, 'createAuth', 'apiKeyIndex', 'api_key_index');
            apiKeyIndex = this.safeInteger (res, 0);
        }
        let accountIndex = this.safeInteger2 (params, 'accountIndex', 'account_index');
        if (accountIndex === undefined) {
            const res = this.handleOptionAndParams2 ({}, 'createAuth', 'accountIndex', 'account_index');
            accountIndex = this.safeInteger (res, 0);
        }
        const signer = this.loadAccount (304, privateKey, apiKeyIndex, accountIndex);
        const rs = {
            'deadline': this.seconds () + 60,
            'api_key_index': apiKeyIndex,
            'account_index': accountIndex,
        };
        return this.createLighterAuth (signer, rs);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @method
         * @ignore
         * @name lighter#createOrderRequest
         * @description helper function to build the request
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency
         * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} request to be sent to the exchange
         */
        const reduceOnly = this.safeBool2 (params, 'reduceOnly', 'reduce_only', false); // default false
        const orderType = type.toUpperCase ();
        const market = this.market (symbol);
        const orderSide = side.toUpperCase ();
        const request: Dict = {
            'market_index': market['id'],
        };
        let nonce = undefined;
        let apiKeyIndex = undefined;
        let accountIndex = undefined;
        [ nonce, params ] = this.handleOptionAndParams (params, 'createOrder', 'nonce');
        [ apiKeyIndex, params ] = this.handleOptionAndParams (params, 'createOrder', 'apiKeyIndex', 255);
        [ accountIndex, params ] = this.handleOptionAndParams (params, 'createOrder', 'accountIndex', 0);
        request['nonce'] = nonce;
        request['api_key_index'] = apiKeyIndex;
        request['account_index'] = accountIndex;
        if (orderType === 'MARKET') {
            request['order_type'] = 1;
            request['order_expiry'] = 0; // IOC_EXPIRY
            request['time_in_force'] = 0; // ORDER_TIME_IN_FORCE_IMMEDIATE_OR_CANCEL
        }
        if (orderSide === 'BUY') {
            request['is_ask'] = 0;
        } else {
            request['is_ask'] = 1;
        }
        request['reduce_only'] = (reduceOnly) ? 1 : 0;
        request['client_order_index'] = 0;
        request['base_amount'] = this.parseToInt (amount);
        request['avg_execution_price'] = this.parseToInt (price);
        // const triggerPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        // const stopLoss = this.safeValue (params, 'stopLoss');
        // const takeProfit = this.safeValue (params, 'takeProfit');
        // const hasStopLoss = (stopLoss !== undefined);
        // const hasTakeProfit = (takeProfit !== undefined);
        // const algoType = this.safeString (params, 'algoType');
        // const isConditional = triggerPrice !== undefined || hasStopLoss || hasTakeProfit || (this.safeValue (params, 'childOrders') !== undefined);
        // const isMarket = orderType === 'MARKET';
        // const timeInForce = this.safeStringLower (params, 'timeInForce');
        // const postOnly = this.isPostOnly (isMarket, undefined, params);
        // const orderQtyKey = isConditional ? 'quantity' : 'order_quantity';
        // const priceKey = isConditional ? 'price' : 'order_price';
        // const typeKey = isConditional ? 'type' : 'order_type';
        // request[typeKey] = orderType; // LIMIT/MARKET/IOC/FOK/POST_ONLY/ASK/BID
        // if (!isConditional) {
        //     if (postOnly) {
        //         request['order_type'] = 'POST_ONLY';
        //     } else if (timeInForce === 'fok') {
        //         request['order_type'] = 'FOK';
        //     } else if (timeInForce === 'ioc') {
        //         request['order_type'] = 'IOC';
        //     }
        // }
        // if (reduceOnly) {
        //     request['reduce_only'] = reduceOnly;
        // }
        // if (price !== undefined) {
        //     request[priceKey] = this.priceToPrecision (symbol, price);
        // }
        // if (isMarket && !isConditional) {
        //     request[orderQtyKey] = this.amountToPrecision (symbol, amount);
        // } else if (algoType !== 'POSITIONAL_TP_SL') {
        //     request[orderQtyKey] = this.amountToPrecision (symbol, amount);
        // }
        // const clientOrderId = this.safeStringN (params, [ 'clOrdID', 'clientOrderId', 'client_order_id' ]);
        // if (clientOrderId !== undefined) {
        //     request['client_order_id'] = clientOrderId;
        // }
        // if (triggerPrice !== undefined) {
        //     request['trigger_price'] = this.priceToPrecision (symbol, triggerPrice);
        //     request['algo_type'] = 'STOP';
        // } else if (hasStopLoss || hasTakeProfit) {
        //     request['algo_type'] = 'TP_SL';
        //     const outterOrder: Dict = {
        //         'symbol': market['id'],
        //         'reduce_only': false,
        //         'algo_type': 'POSITIONAL_TP_SL',
        //         'child_orders': [],
        //     };
        //     const childOrders = outterOrder['child_orders'];
        //     const closeSide = (orderSide === 'BUY') ? 'SELL' : 'BUY';
        //     if (hasStopLoss) {
        //         const stopLossPrice = this.safeNumber2 (stopLoss, 'triggerPrice', 'price', stopLoss);
        //         const stopLossOrder: Dict = {
        //             'side': closeSide,
        //             'algo_type': 'TP_SL',
        //             'trigger_price': this.priceToPrecision (symbol, stopLossPrice),
        //             'type': 'LIMIT',
        //             'reduce_only': true,
        //         };
        //         childOrders.push (stopLossOrder);
        //     }
        //     if (hasTakeProfit) {
        //         const takeProfitPrice = this.safeNumber2 (takeProfit, 'triggerPrice', 'price', takeProfit);
        //         const takeProfitOrder: Dict = {
        //             'side': closeSide,
        //             'algo_type': 'TP_SL',
        //             'trigger_price': this.priceToPrecision (symbol, takeProfitPrice),
        //             'type': 'LIMIT',
        //             'reduce_only': true,
        //         };
        //         outterOrder.push (takeProfitOrder);
        //     }
        //     request['child_orders'] = [ outterOrder ];
        // }
        params = this.omit (params, [ 'reduceOnly', 'reduce_only', 'timeInForce', 'postOnly', 'nonce', 'apiKeyIndex' ]);
        return this.extend (request, params);
    }

    /**
     * @method
     * @name lighter#createOrder
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderRequest = this.createOrderRequest (symbol, type, side, amount, price, params);
        if (orderRequest['nonce'] === undefined) {
            const nonce = await this.publicGetApikeys ({ 'account_index': orderRequest['account_index'], 'api_key_index': orderRequest['api_key_index'] });
            const keys = this.safeList (nonce, 'api_keys', []);
            const api = this.safeDict (keys, 0, {});
            orderRequest['nonce'] = this.safeInteger (api, 'nonce');
        }
        const signer = this.loadAccount (304, this.privateKey, orderRequest['api_key_index'], orderRequest['account_index']);
        const [ txType, txInfo ] = this.signAndCreateLighterOrder (signer, orderRequest);
        const request = {
            'tx_type': txType,
            'tx_info': txInfo,
        };
        const response = await this.publicPostSendTx (request);
        //
        // {
        //     "code": 200,
        //     "message": "{\"ratelimit\": \"didn't use volume quota\"}",
        //     "tx_hash": "txhash",
        //     "predicted_execution_time_ms": 1766088500120
        // }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name lighter#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://apidocs.lighter.xyz/reference/status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        const response = await this.rootGet (params);
        //
        //     {
        //         "status": "1",
        //         "network_id": "1",
        //         "timestamp": "1717777777"
        //     }
        //
        const status = this.safeString (response, 'status');
        return {
            'status': (status === '200') ? 'ok' : 'error', // if there's no Errors, status = 'ok'
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name lighter#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://apidocs.lighter.xyz/reference/status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.rootGet (params);
        //
        //     {
        //         "status": "1",
        //         "network_id": "1",
        //         "timestamp": "1717777777"
        //     }
        //
        return this.safeTimestamp (response, 'timestamp');
    }

    /**
     * @method
     * @name lighter#fetchMarkets
     * @description retrieves data on all markets for lighter
     * @see https://apidocs.lighter.xyz/reference/orderbookdetails
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetOrderBookDetails (params);
        //
        //     {
        //         "code": 200,
        //         "order_book_details": [
        //             {
        //                 "symbol": "ETH",
        //                 "market_id": 0,
        //                 "status": "active",
        //                 "taker_fee": "0.0000",
        //                 "maker_fee": "0.0000",
        //                 "liquidation_fee": "1.0000",
        //                 "min_base_amount": "0.0050",
        //                 "min_quote_amount": "10.000000",
        //                 "order_quote_limit": "",
        //                 "supported_size_decimals": 4,
        //                 "supported_price_decimals": 2,
        //                 "supported_quote_decimals": 6,
        //                 "size_decimals": 4,
        //                 "price_decimals": 2,
        //                 "quote_multiplier": 1,
        //                 "default_initial_margin_fraction": 500,
        //                 "min_initial_margin_fraction": 200,
        //                 "maintenance_margin_fraction": 120,
        //                 "closeout_margin_fraction": 80,
        //                 "last_trade_price": 3550.69,
        //                 "daily_trades_count": 1197349,
        //                 "daily_base_token_volume": 481297.3509,
        //                 "daily_quote_token_volume": 1671431095.263844,
        //                 "daily_price_low": 3402.41,
        //                 "daily_price_high": 3571.45,
        //                 "daily_price_change": 0.5294300840859545,
        //                 "open_interest": 39559.3278,
        //                 "daily_chart": {},
        //                 "market_config": {
        //                     "market_margin_mode": 0,
        //                     "insurance_fund_account_index": 281474976710655,
        //                     "liquidation_mode": 0,
        //                     "force_reduce_only": false,
        //                     "trading_hours": ""
        //                 }
        //             }
        //         ]
        //     }
        //
        const markets = this.safeList (response, 'order_book_details', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeInteger (market, 'market_id');
            const baseId = this.safeString (market, 'symbol');
            const quoteId = 'USDC';
            const settleId = 'USDC';
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const amountDecimals = this.safeString2 (market, 'size_decimals', 'supported_size_decimals');
            const priceDecimals = this.safeString2 (market, 'price_decimals', 'supported_price_decimals');
            const amountPrecision = (amountDecimals === undefined) ? undefined : this.parseNumber (this.parsePrecision (amountDecimals));
            const pricePrecision = (priceDecimals === undefined) ? undefined : this.parseNumber (this.parsePrecision (priceDecimals));
            const quoteMultiplier = this.safeNumber (market, 'quote_multiplier');
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
                'active': this.safeString (market, 'status') === 'active',
                'contract': true,
                'linear': true,
                'inverse': false,
                'taker': this.safeNumber (market, 'taker_fee'),
                'maker': this.safeNumber (market, 'maker_fee'),
                'contractSize': quoteMultiplier,
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
                        'min': this.safeNumber (market, 'min_base_amount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_quote_amount'),
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': market,
            });
        }
        return result;
    }

    /**
     * @method
     * @name lighter#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://apidocs.lighter.xyz/reference/assetdetails
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetAssetDetails (params);
        //
        //     {
        //         "code": 200,
        //         "asset_details": [
        //             {
        //                 "asset_id": 3,
        //                 "symbol": "USDC",
        //                 "l1_decimals": 6,
        //                 "decimals": 6,
        //                 "min_transfer_amount": "1.000000",
        //                 "min_withdrawal_amount": "1.000000",
        //                 "margin_mode": "enabled",
        //                 "index_price": "1.000000",
        //                 "l1_address": "0x95Fd23d5110f9D89A4b0B7d63D78F5B5Ea5074D1"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'asset_details', []);
        const result: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const id = this.safeString (entry, 'asset_id');
            const code = this.safeCurrencyCode (this.safeString (entry, 'symbol'));
            result[code] = this.safeCurrencyStructure ({
                'id': id,
                'name': code,
                'code': code,
                'precision': this.safeInteger (entry, 'decimals'),
                'active': true,
                'fee': undefined,
                'networks': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'type': 'crypto',
                'limits': {
                    'deposit': {
                        'min': this.safeNumber (entry, 'min_transfer_amount'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (entry, 'min_withdrawal_amount'),
                        'max': undefined,
                    },
                },
                'info': entry,
            });
        }
        return result;
    }

    /**
     * @method
     * @name lighter#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.lighter.xyz/reference/orderbookorders
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market_id': market['id'],
            'limit': 100,
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 100);
        }
        const response = await this.publicGetOrderBookOrders (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "total_asks": 1,
        //         "asks": [
        //             {
        //                 "order_index": 281475565888172,
        //                 "order_id": "281475565888172",
        //                 "owner_account_index": 134436,
        //                 "initial_base_amount": "0.2000",
        //                 "remaining_base_amount": "0.2000",
        //                 "price": "3430.00",
        //                 "order_expiry": 1765419046807
        //             }
        //         ],
        //         "total_bids": 1,
        //         "bids": [
        //             {
        //                 "order_index": 562949401225099,
        //                 "order_id": "562949401225099",
        //                 "owner_account_index": 314236,
        //                 "initial_base_amount": "1.7361",
        //                 "remaining_base_amount": "1.3237",
        //                 "price": "3429.80",
        //                 "order_expiry": 1765419047587
        //             }
        //         ]
        //     }
        //
        const result = this.parseOrderBook (response, market['symbol'], undefined, 'bids', 'asks', 'price', 'remaining_base_amount');
        return result;
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // fetchTicker, fetchTickers
        //     {
        //         "symbol": "ETH",
        //         "market_id": 0,
        //         "status": "active",
        //         "taker_fee": "0.0000",
        //         "maker_fee": "0.0000",
        //         "liquidation_fee": "1.0000",
        //         "min_base_amount": "0.0050",
        //         "min_quote_amount": "10.000000",
        //         "order_quote_limit": "",
        //         "supported_size_decimals": 4,
        //         "supported_price_decimals": 2,
        //         "supported_quote_decimals": 6,
        //         "size_decimals": 4,
        //         "price_decimals": 2,
        //         "quote_multiplier": 1,
        //         "default_initial_margin_fraction": 500,
        //         "min_initial_margin_fraction": 200,
        //         "maintenance_margin_fraction": 120,
        //         "closeout_margin_fraction": 80,
        //         "last_trade_price": 3550.69,
        //         "daily_trades_count": 1197349,
        //         "daily_base_token_volume": 481297.3509,
        //         "daily_quote_token_volume": 1671431095.263844,
        //         "daily_price_low": 3402.41,
        //         "daily_price_high": 3571.45,
        //         "daily_price_change": 0.5294300840859545,
        //         "open_interest": 39559.3278,
        //         "daily_chart": {},
        //         "market_config": {
        //             "market_margin_mode": 0,
        //             "insurance_fund_account_index": 281474976710655,
        //             "liquidation_mode": 0,
        //             "force_reduce_only": false,
        //             "trading_hours": ""
        //         }
        //     }
        //
        // watchTicker, watchTickers
        //     {
        //         "market_id": 0,
        //         "index_price": "3015.56",
        //         "mark_price": "3013.91",
        //         "open_interest": "122736286.659423",
        //         "open_interest_limit": "72057594037927936.000000",
        //         "funding_clamp_small": "0.0500",
        //         "funding_clamp_big": "4.0000",
        //         "last_trade_price": "3013.13",
        //         "current_funding_rate": "0.0012",
        //         "funding_rate": "0.0012",
        //         "funding_timestamp": 1763532000004,
        //         "daily_base_token_volume": 643235.2763,
        //         "daily_quote_token_volume": 1983505435.673896,
        //         "daily_price_low": 2977.42,
        //         "daily_price_high": 3170.81,
        //         "daily_price_change": -0.3061987051035322
        //     }
        //
        const marketId = this.safeString (ticker, 'market_id');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'last_trade_price');
        const high = this.safeString (ticker, 'daily_price_high');
        const low = this.safeString (ticker, 'daily_price_low');
        const baseVolume = this.safeString (ticker, 'daily_base_token_volume');
        const quoteVolume = this.safeString (ticker, 'daily_quote_token_volume');
        const change = this.safeString (ticker, 'daily_price_change');
        const openInterest = this.safeString (ticker, 'open_interest');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'markPrice': this.safeString (ticker, 'mark_price'),
            'indexPrice': this.safeString (ticker, 'index_price'),
            'openInterest': openInterest,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name lighter#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.lighter.xyz/reference/orderbookdetails
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market_id': market['id'],
        };
        const response = await this.publicGetOrderBookDetails (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "order_book_details": [
        //             {
        //                 "symbol": "ETH",
        //                 "market_id": 0,
        //                 "status": "active",
        //                 "taker_fee": "0.0000",
        //                 "maker_fee": "0.0000",
        //                 "liquidation_fee": "1.0000",
        //                 "min_base_amount": "0.0050",
        //                 "min_quote_amount": "10.000000",
        //                 "order_quote_limit": "",
        //                 "supported_size_decimals": 4,
        //                 "supported_price_decimals": 2,
        //                 "supported_quote_decimals": 6,
        //                 "size_decimals": 4,
        //                 "price_decimals": 2,
        //                 "quote_multiplier": 1,
        //                 "default_initial_margin_fraction": 500,
        //                 "min_initial_margin_fraction": 200,
        //                 "maintenance_margin_fraction": 120,
        //                 "closeout_margin_fraction": 80,
        //                 "last_trade_price": 3550.69,
        //                 "daily_trades_count": 1197349,
        //                 "daily_base_token_volume": 481297.3509,
        //                 "daily_quote_token_volume": 1671431095.263844,
        //                 "daily_price_low": 3402.41,
        //                 "daily_price_high": 3571.45,
        //                 "daily_price_change": 0.5294300840859545,
        //                 "open_interest": 39559.3278,
        //                 "daily_chart": {},
        //                 "market_config": {
        //                     "market_margin_mode": 0,
        //                     "insurance_fund_account_index": 281474976710655,
        //                     "liquidation_mode": 0,
        //                     "force_reduce_only": false,
        //                     "trading_hours": ""
        //                 }
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'order_book_details', []);
        const first = this.safeDict (data, 0, {});
        return this.parseTicker (first, market);
    }

    /**
     * @method
     * @name lighter#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://apidocs.lighter.xyz/reference/orderbookdetails
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetOrderBookDetails (params);
        const tickers = this.safeList (response, 'order_book_details', []);
        return this.parseTickers (tickers, symbols);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "timestamp": 1763001300000,
        //         "open": 3438.49,
        //         "high": 3445.58,
        //         "low": 3435.38,
        //         "close": 3439.19,
        //         "open_raw": 0,
        //         "high_raw": 0,
        //         "low_raw": 0,
        //         "close_raw": 0,
        //         "volume0": 1253.4977,
        //         "volume1": 4314077.600513,
        //         "last_trade_id": 464354353
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'timestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume0'),
        ];
    }

    /**
     * @method
     * @name lighter#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://apidocs.lighter.xyz/reference/candlesticks
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, [ 'until' ]);
        const now = this.milliseconds ();
        let startTs = undefined;
        let endTs = undefined;
        if (since !== undefined) {
            startTs = since;
            if (until !== undefined) {
                endTs = until;
            } else if (limit !== undefined) {
                const duration = this.parseTimeframe (timeframe);
                endTs = this.sum (since, duration * limit * 1000);
            } else {
                endTs = now;
            }
        } else {
            endTs = (until !== undefined) ? until : now;
            const defaultLimit = 100;
            if (limit !== undefined) {
                startTs = endTs - this.parseTimeframe (timeframe) * 1000 * limit;
            } else {
                startTs = endTs - this.parseTimeframe (timeframe) * 1000 * defaultLimit;
            }
        }
        const request: Dict = {
            'market_id': market['id'],
            'count_back': 0,
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
            'start_timestamp': startTs,
            'end_timestamp': endTs,
        };
        const response = await this.publicGetCandlesticks (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "resolution": "5m",
        //         "candlesticks": [
        //             {
        //                 "timestamp": 1763001300000,
        //                 "open": 3438.49,
        //                 "high": 3445.58,
        //                 "low": 3435.38,
        //                 "close": 3439.19,
        //                 "open_raw": 0,
        //                 "high_raw": 0,
        //                 "low_raw": 0,
        //                 "close_raw": 0,
        //                 "volume0": 1253.4977,
        //                 "volume1": 4314077.600513,
        //                 "last_trade_id": 464354353
        //             }
        //         ]
        //     }
        //
        const ohlcvs = this.safeList (response, 'candlesticks', []);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        //
        //     {
        //         "market_id": 0,
        //         "exchange": "lighter",
        //         "symbol": "ETH",
        //         "rate": 0.00009599999999999999
        //     }
        //
        const marketId = this.safeString (contract, 'market_id');
        return {
            'info': contract,
            'symbol': this.safeSymbol (marketId, market),
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'rate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        } as FundingRate;
    }

    /**
     * @method
     * @name lighter#fetchFundingRates
     * @description fetch the current funding rate for multiple symbols
     * @see https://apidocs.lighter.xyz/reference/funding-rates
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        const response = await this.publicGetFundingRates (this.extend (params));
        //
        //     {
        //         "code": 200,
        //         "funding_rates": [
        //             {
        //                 "market_id": 0,
        //                 "exchange": "lighter",
        //                 "symbol": "ETH",
        //                 "rate": 0.00009599999999999999
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'funding_rates', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const exchange = this.safeString (data[i], 'exchange');
            if (exchange === 'lighter') {
                result.push (data[i]);
            }
        }
        return this.parseFundingRates (result, symbols);
    }

    /**
     * @method
     * @name ligher#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://apidocs.lighter.xyz/reference/account-1
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.by] fetch balance by 'index' or 'l1_address', defaults to 'index'
     * @param {string} [params.value] fetch balance value, account index or l1 address
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let accountIndex = undefined;
        [ accountIndex, params ] = this.handleOptionAndParams2 (params, 'fetchBalance', 'accountIndex', 'account_index');
        const request: Dict = {
            'by': this.safeString (params, 'by', 'index'),
            'value': accountIndex,
        };
        const response = await this.publicGetAccount (this.extend (request, params));
        //
        //     {
        //         "code": "200",
        //         "total": "1",
        //         "accounts": [
        //             {
        //                 "code": "0",
        //                 "account_type": "0",
        //                 "index": "1077",
        //                 "l1_address": "0x15f43D1f2DeE81424aFd891943262aa90F22cc2A",
        //                 "cancel_all_time": "0",
        //                 "total_order_count": "1",
        //                 "total_isolated_order_count": "0",
        //                 "pending_order_count": "0",
        //                 "available_balance": "7996.489834",
        //                 "status": "1",
        //                 "collateral": "9000.000000",
        //                 "account_index": "1077",
        //                 "name": "",
        //                 "description": "",
        //                 "can_invite": true,
        //                 "referral_points_percentage": "",
        //                 "positions": [],
        //                 "assets": [
        //                     {
        //                         "symbol": "ETH",
        //                         "asset_id": "1",
        //                         "balance": "3.00000000",
        //                         "locked_balance": "0.00000000"
        //                     },
        //                     {
        //                         "symbol": "USDC",
        //                         "asset_id": "3",
        //                         "balance": "1000.000000",
        //                         "locked_balance": "0.000000"
        //                     }
        //                 ],
        //                 "total_asset_value": "9536.789088",
        //                 "cross_asset_value": "9536.789088",
        //                 "shares": []
        //             }
        //         ]
        //     }
        //
        const result: Dict = { 'info': response };
        const accounts = this.safeList (response, 'accounts', []);
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            const assets = this.safeList (account, 'assets', []);
            for (let j = 0; j < assets.length; j++) {
                const asset = assets[j];
                const codeId = this.safeString (asset, 'symbol');
                const code = this.safeCurrencyCode (codeId);
                const balance = this.safeDict (result, code, this.account ());
                balance['total'] = Precise.stringAdd (balance['total'], this.safeString (asset, 'balance'));
                balance['used'] = Precise.stringAdd (balance['used'], this.safeString (asset, 'locked_balance'));
                result[code] = balance;
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name lighter#fetchPosition
     * @description fetch data on an open position
     * @see https://apidocs.lighter.xyz/reference/account-1
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.by] fetch balance by 'index' or 'l1_address', defaults to 'index'
     * @param {string} [params.value] fetch balance value, account index or l1 address
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPosition (symbol: string, params = {}) {
        const positions = await this.fetchPositions ([ symbol ], params);
        return this.safeDict (positions, 0, {}) as Position;
    }

    /**
     * @method
     * @name lighter#fetchPositions
     * @description fetch all open positions
     * @see https://apidocs.lighter.xyz/reference/account-1
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.by] fetch balance by 'index' or 'l1_address', defaults to 'index'
     * @param {string} [params.value] fetch balance value, account index or l1 address
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        let accountIndex = undefined;
        [ accountIndex, params ] = this.handleOptionAndParams2 (params, 'fetchPositions', 'accountIndex', 'account_index');
        const request: Dict = {
            'by': this.safeString (params, 'by', 'index'),
            'value': accountIndex,
        };
        const response = await this.publicGetAccount (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "total": 2,
        //         "accounts": [
        //             {
        //                 "code": 0,
        //                 "account_type": 0,
        //                 "index": 1077,
        //                 "l1_address": "0x15f43D1f2DeE81424aFd891943262aa90F22cc2A",
        //                 "cancel_all_time": 0,
        //                 "total_order_count": 0,
        //                 "total_isolated_order_count": 0,
        //                 "pending_order_count": 0,
        //                 "available_balance": "12582.743947",
        //                 "status": 1,
        //                 "collateral": "9100.242706",
        //                 "account_index": 1077,
        //                 "name": "",
        //                 "description": "",
        //                 "can_invite": true,
        //                 "referral_points_percentage": "",
        //                 "positions": [
        //                     {
        //                         "market_id": 0,
        //                         "symbol": "ETH",
        //                         "initial_margin_fraction": "5.00",
        //                         "open_order_count": 0,
        //                         "pending_order_count": 0,
        //                         "position_tied_order_count": 0,
        //                         "sign": 1,
        //                         "position": "18.0193",
        //                         "avg_entry_price": "2669.84",
        //                         "position_value": "54306.566340",
        //                         "unrealized_pnl": "6197.829558",
        //                         "realized_pnl": "0.000000",
        //                         "liquidation_price": "2191.1107231380406",
        //                         "margin_mode": 0,
        //                         "allocated_margin": "0.000000"
        //                     }
        //                 ],
        //                 "assets": [],
        //                 "total_asset_value": "15298.072264000002",
        //                 "cross_asset_value": "15298.072264000002",
        //                 "shares": []
        //             }
        //         ]
        //     }
        //
        const allPositions = [];
        const accounts = this.safeList (response, 'accounts', []);
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            const positions = this.safeList (account, 'positions', []);
            for (let j = 0; j < positions.length; j++) {
                allPositions.push (positions[j]);
            }
        }
        return this.parsePositions (allPositions, symbols);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        //     {
        //         "market_id": 0,
        //         "symbol": "ETH",
        //         "initial_margin_fraction": "5.00",
        //         "open_order_count": 0,
        //         "pending_order_count": 0,
        //         "position_tied_order_count": 0,
        //         "sign": 1,
        //         "position": "18.0193",
        //         "avg_entry_price": "2669.84",
        //         "position_value": "54306.566340",
        //         "unrealized_pnl": "6197.829558",
        //         "realized_pnl": "0.000000",
        //         "liquidation_price": "2191.1107231380406",
        //         "margin_mode": 0,
        //         "allocated_margin": "0.000000"
        //     }
        //
        const marketId = this.safeString (position, 'market_id');
        market = this.safeMarket (marketId, market);
        const sign = this.safeInteger (position, 'sign');
        let side = undefined;
        if (sign !== undefined) {
            side = (sign === 1) ? 'long' : 'short';
        }
        const marginModeId = this.safeInteger (position, 'margin_mode');
        let marginMode = undefined;
        if (marginModeId !== undefined) {
            marginMode = (marginModeId === 0) ? 'cross' : 'isolated';
        }
        const imf = this.safeNumber (position, 'initial_margin_fraction');
        let leverage = undefined;
        if (imf !== undefined && imf > 0) {
            leverage = 100 / imf;
        }
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'isolated': (marginMode === 'isolated'),
            'hedged': undefined,
            'side': side,
            'contracts': this.safeNumber (position, 'position'),
            'contractSize': undefined,
            'entryPrice': this.safeNumber (position, 'avg_entry_price'),
            'markPrice': undefined,
            'notional': this.safeNumber (position, 'position_value'),
            'leverage': leverage,
            'collateral': this.safeNumber (position, 'allocated_margin'),
            'initialMargin': undefined,
            'maintenanceMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': this.safeNumber (position, 'unrealized_pnl'),
            'liquidationPrice': this.safeNumber (position, 'liquidation_price'),
            'marginMode': marginMode,
            'percentage': undefined,
        });
    }

    /**
     * @method
     * @name lighter#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://apidocs.lighter.xyz/reference/accountactiveorders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        let accountIndex = undefined;
        [ accountIndex, params ] = this.handleOptionAndParams2 (params, 'fetchOpenOrders', 'accountIndex', 'account_index');
        if (accountIndex === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires an accountIndex parameter');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market_id': market['id'],
            'account_index': accountIndex,
        };
        const response = await this.privateGetAccountActiveOrders (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "orders": [
        //             {
        //                 "order_index": 281474977354074,
        //                 "client_order_index": 0,
        //                 "order_id": "281474977354074",
        //                 "client_order_id": "0",
        //                 "market_index": 0,
        //                 "owner_account_index": 1077,
        //                 "initial_base_amount": "36.0386",
        //                 "price": "2221.60",
        //                 "nonce": 643418,
        //                 "remaining_base_amount": "0.0000",
        //                 "is_ask": true,
        //                 "base_size": 0,
        //                 "base_price": 222160,
        //                 "filled_base_amount": "0.0000",
        //                 "filled_quote_amount": "0.000000",
        //                 "side": "",
        //                 "type": "market",
        //                 "time_in_force": "immediate-or-cancel",
        //                 "reduce_only": false,
        //                 "trigger_price": "0.00",
        //                 "order_expiry": 0,
        //                 "status": "canceled-margin-not-allowed",
        //                 "trigger_status": "na",
        //                 "trigger_time": 0,
        //                 "parent_order_index": 0,
        //                 "parent_order_id": "0",
        //                 "to_trigger_order_id_0": "0",
        //                 "to_trigger_order_id_1": "0",
        //                 "to_cancel_order_id_0": "0",
        //                 "block_height": 102202,
        //                 "timestamp": 1766387932,
        //                 "created_at": 1766387932,
        //                 "updated_at": 1766387932
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'orders', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name lighter#fetchClosedOrders
     * @description fetch all unfilled currently closed orders
     * @see https://apidocs.lighter.xyz/reference/accountinactiveorders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        let accountIndex = undefined;
        [ accountIndex, params ] = this.handleOptionAndParams2 (params, 'fetchClosedOrders', 'accountIndex', 'account_index');
        if (accountIndex === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires an accountIndex parameter');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market_id': market['id'],
            'account_index': accountIndex,
            'limit': 100, // required, max 100
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 100);
        }
        const response = await this.privateGetAccountInactiveOrders (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "orders": [
        //             {
        //                 "order_index": 281474977354074,
        //                 "client_order_index": 0,
        //                 "order_id": "281474977354074",
        //                 "client_order_id": "0",
        //                 "market_index": 0,
        //                 "owner_account_index": 1077,
        //                 "initial_base_amount": "36.0386",
        //                 "price": "2221.60",
        //                 "nonce": 643418,
        //                 "remaining_base_amount": "0.0000",
        //                 "is_ask": true,
        //                 "base_size": 0,
        //                 "base_price": 222160,
        //                 "filled_base_amount": "0.0000",
        //                 "filled_quote_amount": "0.000000",
        //                 "side": "",
        //                 "type": "market",
        //                 "time_in_force": "immediate-or-cancel",
        //                 "reduce_only": false,
        //                 "trigger_price": "0.00",
        //                 "order_expiry": 0,
        //                 "status": "canceled-margin-not-allowed",
        //                 "trigger_status": "na",
        //                 "trigger_time": 0,
        //                 "parent_order_index": 0,
        //                 "parent_order_id": "0",
        //                 "to_trigger_order_id_0": "0",
        //                 "to_trigger_order_id_1": "0",
        //                 "to_cancel_order_id_0": "0",
        //                 "block_height": 102202,
        //                 "timestamp": 1766387932,
        //                 "created_at": 1766387932,
        //                 "updated_at": 1766387932
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'orders', []);
        return this.parseOrders (data, market, since, limit);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "order_index": 281474977354074,
        //         "client_order_index": 0,
        //         "order_id": "281474977354074",
        //         "client_order_id": "0",
        //         "market_index": 0,
        //         "owner_account_index": 1077,
        //         "initial_base_amount": "36.0386",
        //         "price": "2221.60",
        //         "nonce": 643418,
        //         "remaining_base_amount": "0.0000",
        //         "is_ask": true,
        //         "base_size": 0,
        //         "base_price": 222160,
        //         "filled_base_amount": "0.0000",
        //         "filled_quote_amount": "0.000000",
        //         "side": "",
        //         "type": "market",
        //         "time_in_force": "immediate-or-cancel",
        //         "reduce_only": false,
        //         "trigger_price": "0.00",
        //         "order_expiry": 0,
        //         "status": "canceled-margin-not-allowed",
        //         "trigger_status": "na",
        //         "trigger_time": 0,
        //         "parent_order_index": 0,
        //         "parent_order_id": "0",
        //         "to_trigger_order_id_0": "0",
        //         "to_trigger_order_id_1": "0",
        //         "to_cancel_order_id_0": "0",
        //         "block_height": 102202,
        //         "timestamp": 1766387932,
        //         "created_at": 1766387932,
        //         "updated_at": 1766387932
        //     }
        //
        const marketId = this.safeString (order, 'market_index');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeTimestamp (order, 'timestamp');
        const isAsk = this.safeBool (order, 'is_ask');
        let side = undefined;
        if (isAsk !== undefined) {
            side = isAsk ? 'sell' : 'buy';
        }
        const type = this.safeString (order, 'type');
        const tif = this.safeString (order, 'time_in_force');
        const status = this.safeString (order, 'status');
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'order_id'),
            'clientOrderId': this.omitZero (this.safeString (order, 'client_order_id')),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeTimestamp (order, 'updated_at'),
            'symbol': market['symbol'],
            'type': this.parseOrderType (type),
            'timeInForce': this.parseOrderTimeInForeces (tif),
            'postOnly': undefined,
            'reduceOnly': this.safeBool (order, 'reduce_only'),
            'side': side,
            'price': this.safeString (order, 'price'),
            'triggerPrice': this.parseNumber (this.omitZero (this.safeString (order, 'trigger_price'))),
            'amount': this.safeString (order, 'initial_base_amount'),
            'cost': this.safeString (order, 'filled_quote_amount'),
            'average': undefined,
            'filled': this.safeString (order, 'filled_base_amount'),
            'remaining': this.safeString (order, 'remaining_base_amount'),
            'status': this.parseOrderStatus (status),
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'in-progress': 'open',
            'pending': 'open',
            'open': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
            'canceled-post-only': 'canceled',
            'canceled-reduce-only': 'canceled',
            'canceled-position-not-allowed': 'rejected',
            'canceled-margin-not-allowed': 'rejected',
            'canceled-too-much-slippage': 'canceled',
            'canceled-not-enough-liquidity': 'canceled',
            'canceled-self-trade': 'canceled',
            'canceled-expired': 'expired',
            'canceled-oco': 'canceled',
            'canceled-child': 'canceled',
            'canceled-liquidation': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (status) {
        const statuses: Dict = {
            'limit': 'limit',
            'market': 'market',
            'stop-loss': 'market',
            'stop-loss-limit': 'limit',
            'take-profit': 'market',
            'take-profit-limit': 'limit',
            'twap': 'twap',
            'twap-sub': 'twap',
            'liquidation': 'market',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderTimeInForeces (tif) {
        const timeInForces: Dict = {
            'good-till-time': 'GTC',
            'immediate-or-cancel': 'IOC',
            'post-only': 'PO',
            'Unknown': undefined,
        };
        return this.safeString (timeInForces, tif, tif);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = undefined;
        if (api === 'root') {
            url = this.implodeHostname (this.urls['api']['public']);
        } else {
            url = this.implodeHostname (this.urls['api'][api]) + '/api/' + this.version + '/' + path;
        }
        if (api === 'private') {
            headers = {
                'Authorization': this.createAuth (params),
            };
        }
        if (Object.keys (params).length) {
            if (method === 'POST') {
                headers = {
                    'Content-Type': 'multipart/form-data',
                };
                body = params;
            } else {
                url += '?' + this.rawencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     {
        //         "code": "200",
        //         "message": "string"
        //     }
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        if (code !== undefined && code !== '0' && code !== '200') {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
