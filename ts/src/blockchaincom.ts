//  ---------------------------------------------------------------------------
import Exchange from './abstract/blockchaincom.js';
import { ExchangeError, AuthenticationError, OrderNotFound, InsufficientFunds, ArgumentsRequired } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Int, OrderSide, OrderType } from './base/types.js';

// ---------------------------------------------------------------------------

export default class blockchaincom extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'blockchaincom',
            'secret': undefined,
            'name': 'Blockchain.com',
            'countries': [ 'LX' ],
            'rateLimit': 500, // prev 1000
            'version': 'v3',
            'pro': true,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': undefined, // on exchange but not implemented in CCXT
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchL2OrderBook': true,
                'fetchL3OrderBook': true,
                'fetchLedger': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPositionMode': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': true, // fetches exchange specific benficiary-ids needed for withdrawals
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': undefined,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/147515585-1296e91b-7398-45e5-9d32-f6121538533f.jpeg',
                'test': {
                    'public': 'https://testnet-api.delta.exchange',
                    'private': 'https://testnet-api.delta.exchange',
                },
                'api': {
                    'public': 'https://api.blockchain.com/v3/exchange',
                    'private': 'https://api.blockchain.com/v3/exchange',
                },
                'www': 'https://blockchain.com',
                'doc': [
                    'https://api.blockchain.com/v3',
                ],
                'fees': 'https://exchange.blockchain.com/fees',
            },
            'api': {
                'public': {
                    'get': {
                        'tickers': 1, // fetchTickers
                        'tickers/{symbol}': 1, // fetchTicker
                        'symbols': 1, // fetchMarkets
                        'symbols/{symbol}': 1, // fetchMarket
                        'l2/{symbol}': 1, // fetchL2OrderBook
                        'l3/{symbol}': 1, // fetchL3OrderBook
                    },
                },
                'private': {
                    'get': {
                        'fees': 1, // fetchFees
                        'orders': 1, // fetchOpenOrders, fetchClosedOrders
                        'orders/{orderId}': 1, // fetchOrder(id)
                        'trades': 1,
                        'fills': 1, // fetchMyTrades
                        'deposits': 1, // fetchDeposits
                        'deposits/{depositId}': 1, // fetchDeposit
                        'accounts': 1, // fetchBalance
                        'accounts/{account}/{currency}': 1,
                        'whitelist': 1, // fetchWithdrawalWhitelist
                        'whitelist/{currency}': 1, // fetchWithdrawalWhitelistByCurrency
                        'withdrawals': 1, // fetchWithdrawalWhitelist
                        'withdrawals/{withdrawalId}': 1, // fetchWithdrawalById
                    },
                    'post': {
                        'orders': 1, // createOrder
                        'deposits/{currency}': 1, // fetchDepositAddress by currency (only crypto supported)
                        'withdrawals': 1, // withdraw
                    },
                    'delete': {
                        'orders': 1, // cancelOrders
                        'orders/{orderId}': 1, // cancelOrder
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.004') ],
                            [ this.parseNumber ('10000'), this.parseNumber ('0.0022') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0018') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.0018') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0018') ],
                            [ this.parseNumber ('2500000'), this.parseNumber ('0.0018') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0016') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.0014') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.0011') ],
                            [ this.parseNumber ('500000000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('1000000000'), this.parseNumber ('0.0006') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('10000'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.0007000000000000001') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('2500000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('500000000'), this.parseNumber ('0.0001') ],
                            [ this.parseNumber ('1000000000'), this.parseNumber ('0') ],
                        ],
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': true,
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '401': AuthenticationError,
                    '404': OrderNotFound,
                },
                'broad': {},
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchMarkets
         * @description retrieves data on all markets for blockchaincom
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        //
        //     "USDC-GBP": {
        //         "base_currency": "USDC",
        //         "base_currency_scale": 6,
        //         "counter_currency": "GBP",
        //         "counter_currency_scale": 2,
        //         "min_price_increment": 10000,
        //         "min_price_increment_scale": 8,
        //         "min_order_size": 500000000,
        //         "min_order_size_scale": 8,
        //         "max_order_size": 0,
        //         "max_order_size_scale": 8,
        //         "lot_size": 10000,
        //         "lot_size_scale": 8,
        //         "status": "open",
        //         "id": 68,
        //         "auction_price": 0,
        //         "auction_size": 0,
        //         "auction_time": "",
        //         "imbalance": 0
        //     }
        //
        const markets = await this.publicGetSymbols (params);
        const marketIds = Object.keys (markets);
        const result = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeValue (markets, marketId);
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'counter_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const numericId = this.safeNumber (market, 'id');
            let active = undefined;
            const marketState = this.safeString (market, 'status');
            if (marketState === 'open') {
                active = true;
            } else {
                active = false;
            }
            // price precision
            const minPriceIncrementString = this.safeString (market, 'min_price_increment');
            const minPriceIncrementScaleString = this.safeString (market, 'min_price_increment_scale');
            const minPriceScalePrecisionString = this.parsePrecision (minPriceIncrementScaleString);
            const pricePrecisionString = Precise.stringMul (minPriceIncrementString, minPriceScalePrecisionString);
            // amount precision
            const lotSizeString = this.safeString (market, 'lot_size');
            const lotSizeScaleString = this.safeString (market, 'lot_size_scale');
            const lotSizeScalePrecisionString = this.parsePrecision (lotSizeScaleString);
            const amountPrecisionString = Precise.stringMul (lotSizeString, lotSizeScalePrecisionString);
            // minimum order size
            const minOrderSizeString = this.safeString (market, 'min_order_size');
            const minOrderSizeScaleString = this.safeString (market, 'min_order_size_scale');
            const minOrderSizeScalePrecisionString = this.parsePrecision (minOrderSizeScaleString);
            const minOrderSizePreciseString = Precise.stringMul (minOrderSizeString, minOrderSizeScalePrecisionString);
            const minOrderSize = this.parseNumber (minOrderSizePreciseString);
            // maximum order size
            let maxOrderSize = undefined;
            maxOrderSize = this.safeString (market, 'max_order_size');
            if (maxOrderSize !== '0') {
                const maxOrderSizeScaleString = this.safeString (market, 'max_order_size_scale');
                const maxOrderSizeScalePrecisionString = this.parsePrecision (maxOrderSizeScaleString);
                const maxOrderSizeString = Precise.stringMul (maxOrderSize, maxOrderSizeScalePrecisionString);
                maxOrderSize = this.parseNumber (maxOrderSizeString);
            } else {
                maxOrderSize = undefined;
            }
            result.push ({
                'info': market,
                'id': marketId,
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
                    'amount': this.parseNumber (amountPrecisionString),
                    'price': this.parseNumber (pricePrecisionString),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': minOrderSize,
                        'max': maxOrderSize,
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
            });
        }
        return result;
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        return await this.fetchL3OrderBook (symbol, limit, params);
    }

    async fetchL3OrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchL3OrderBook
         * @description fetches level 3 information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified market symbol
         * @param {int|undefined} limit max number of orders to return, default is undefined
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} an [order book structure]{@link https://docs.ccxt.com/#/?id=order-book-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetL3Symbol (this.extend (request, params));
        return this.parseOrderBook (response, market['symbol'], undefined, 'bids', 'asks', 'px', 'qty');
    }

    async fetchL2OrderBook (symbol: string, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetL2Symbol (this.extend (request, params));
        return this.parseOrderBook (response, market['symbol'], undefined, 'bids', 'asks', 'px', 'qty');
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //     "symbol": "BTC-USD",
        //     "price_24h": 47791.86,
        //     "volume_24h": 362.88635738,
        //     "last_trade_price": 47587.75
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '-');
        const last = this.safeString (ticker, 'last_trade_price');
        const baseVolume = this.safeString (ticker, 'volume_24h');
        const open = this.safeString (ticker, 'price_24h');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': undefined,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTickersSymbol (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const tickers = await this.publicGetTickers (params);
        return this.parseTickers (tickers, symbols);
    }

    parseOrderState (state) {
        const states = {
            'OPEN': 'open',
            'REJECTED': 'rejected',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PART_FILLED': 'open',
            'EXPIRED': 'expired',
        };
        return this.safeString (states, state, state);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         clOrdId: '00001',
        //         ordType: 'MARKET',
        //         ordStatus: 'FILLED',
        //         side: 'BUY',
        //         symbol: 'USDC-USDT',
        //         exOrdId: '281775861306290',
        //         price: null,
        //         text: 'Fill',
        //         lastShares: '30.0',
        //         lastPx: '0.9999',
        //         leavesQty: '0.0',
        //         cumQty: '30.0',
        //         avgPx: '0.9999',
        //         timestamp: '1633940339619'
        //     }
        //
        const clientOrderId = this.safeString (order, 'clOrdId');
        const type = this.safeStringLower (order, 'ordType');
        const statusId = this.safeString (order, 'ordStatus');
        const state = this.parseOrderState (statusId);
        const side = this.safeStringLower (order, 'side');
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '-');
        const exchangeOrderId = this.safeString (order, 'exOrdId');
        const price = (type !== 'market') ? this.safeString (order, 'price') : undefined;
        const average = this.safeNumber (order, 'avgPx');
        const timestamp = this.safeInteger (order, 'timestamp');
        const datetime = this.iso8601 (timestamp);
        const filled = this.safeString (order, 'cumQty');
        const remaining = this.safeString (order, 'leavesQty');
        const result = this.safeOrder ({
            'id': exchangeOrderId,
            'clientOrderId': clientOrderId,
            'datetime': datetime,
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': state,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'side': side,
            'price': price,
            'average': average,
            'amount': undefined,
            'filled': filled,
            'remaining': remaining,
            'cost': undefined,
            'trades': [],
            'fees': {},
            'info': order,
        });
        return result;
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderType = this.safeString (params, 'ordType', type);
        const uppercaseOrderType = orderType.toUpperCase ();
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clOrdId', this.uuid16 ());
        params = this.omit (params, [ 'ordType', 'clientOrderId', 'clOrdId' ]);
        const request = {
            // 'stopPx' : limit price
            // 'timeInForce' : "GTC" for Good Till Cancel, "IOC" for Immediate or Cancel, "FOK" for Fill or Kill, "GTD" Good Till Date
            // 'expireDate' : expiry date in the format YYYYMMDD
            // 'minQty' : The minimum quantity required for an IOC fill
            'ordType': uppercaseOrderType,
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'orderQty': this.amountToPrecision (symbol, amount),
            'clOrdId': clientOrderId,
        };
        const stopPrice = this.safeValue2 (params, 'stopPx', 'stopPrice');
        params = this.omit (params, [ 'stopPx', 'stopPrice' ]);
        if (uppercaseOrderType === 'STOP' || uppercaseOrderType === 'STOPLIMIT') {
            if (stopPrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a stopPx or stopPrice param for a ' + uppercaseOrderType + ' order');
            }
        }
        if (stopPrice !== undefined) {
            if (uppercaseOrderType === 'MARKET') {
                request['ordType'] = 'STOP';
            } else if (uppercaseOrderType === 'LIMIT') {
                request['ordType'] = 'STOPLIMIT';
            }
        }
        let priceRequired = false;
        let stopPriceRequired = false;
        if (request['ordType'] === 'LIMIT' || request['ordType'] === 'STOPLIMIT') {
            priceRequired = true;
        }
        if (request['ordType'] === 'STOP' || request['ordType'] === 'STOPLIMIT') {
            stopPriceRequired = true;
        }
        if (priceRequired) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (stopPriceRequired) {
            request['stopPx'] = this.priceToPrecision (symbol, stopPrice);
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'orderId': id,
        };
        const response = await this.privateDeleteOrdersOrderId (this.extend (request, params));
        return {
            'id': id,
            'info': response,
        };
    }

    async cancelAllOrders (symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol of the market to cancel orders in, all markets are used if undefined, default is undefined
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        // cancels all open orders if no symbol specified
        // cancels all open orders of specified symbol, if symbol is specified
        await this.loadMarkets ();
        const request = {
            // 'symbol': marketId,
        };
        if (symbol !== undefined) {
            const marketId = this.marketId (symbol);
            request['symbol'] = marketId;
        }
        const response = await this.privateDeleteOrders (this.extend (request, params));
        return {
            'symbol': symbol,
            'info': response,
        };
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.privateGetFees (params);
        //
        //     {
        //         makerRate: "0.002",
        //         takerRate: "0.004",
        //         volumeInUSD: "0.0"
        //     }
        //
        const makerFee = this.safeNumber (response, 'makerRate');
        const takerFee = this.safeNumber (response, 'takerRate');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': makerFee,
                'taker': takerFee,
            };
        }
        return result;
    }

    async fetchCanceledOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchCanceledOrders
         * @description fetches information on multiple canceled orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since timestamp in ms of the earliest order, default is undefined
         * @param {int|undefined} limit max number of orders to return, default is undefined
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const state = 'CANCELED';
        return await this.fetchOrdersByState (state, symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const state = 'FILLED';
        return await this.fetchOrdersByState (state, symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const state = 'OPEN';
        return await this.fetchOrdersByState (state, symbol, since, limit, params);
    }

    async fetchOrdersByState (state, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'to': unix epoch ms
            // 'from': unix epoch ms
            'status': state,
            'limit': 100,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        //     {
        //         "exOrdId":281685751028507,
        //         "tradeId":281685434947633,
        //         "execId":8847494003,
        //         "side":"BUY",
        //         "symbol":"AAVE-USDT",
        //         "price":405.34,
        //         "qty":0.1,
        //         "fee":0.162136,
        //         "timestamp":1634559249687
        //     }
        //
        const orderId = this.safeString (trade, 'exOrdId');
        const tradeId = this.safeString (trade, 'tradeId');
        const side = this.safeString (trade, 'side').toLowerCase ();
        const marketId = this.safeString (trade, 'symbol');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'qty');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const datetime = this.iso8601 (timestamp);
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrency = market['quote'];
            fee = { 'cost': feeCostString, 'currency': feeCurrency };
        }
        return this.safeTrade ({
            'id': tradeId,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let market = undefined;
        if (symbol !== undefined) {
            request['symbol'] = this.marketId (symbol);
            market = this.market (symbol);
        }
        const trades = await this.privateGetFills (this.extend (request, params));
        return this.parseTrades (trades, market, since, limit, params); // need to define
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostDepositsCurrency (this.extend (request, params));
        const rawAddress = this.safeString (response, 'address');
        let tag = undefined;
        let address = undefined;
        if (rawAddress !== undefined) {
            // if a tag or memo is used it is separated by a colon in the 'address' value
            [ address, tag ] = rawAddress.split (':');
        }
        const result = { 'info': response };
        result['currency'] = currency['code'];
        result['address'] = address;
        if (tag !== undefined) {
            result['tag'] = tag;
        }
        return result;
    }

    parseTransactionState (state) {
        const states = {
            'COMPLETED': 'ok', //
            'REJECTED': 'failed',
            'PENDING': 'pending',
            'FAILED': 'failed',
            'REFUNDED': 'refunded',
        };
        return this.safeString (states, state, state);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // deposit
        //
        //     {
        //         "depositId":"748e9180-be0d-4a80-e175-0156150efc95",
        //         "amount":0.009,
        //         "currency":"ETH",
        //         "address":"0xEC6B5929D454C8D9546d4221ace969E1810Fa92c",
        //         "state":"COMPLETED",
        //         "txHash":"582114562140e51a80b481c2dfebaf62b4ab9769b8ff54820bb67e34d4a3ab0c",
        //         "timestamp":1633697196241
        //     }
        //
        // withdrawal
        //
        //     {
        //         "amount":30.0,
        //         "currency":"USDT",
        //         "beneficiary":"cab00d11-6e7f-46b7-b453-2e8ef6f101fa", // blockchain specific id
        //         "withdrawalId":"99df5ef7-eab6-4033-be49-312930fbd1ea",
        //         "fee":34.005078,
        //         "state":"COMPLETED",
        //         "timestamp":1634218452549
        //     }
        //
        let type = undefined;
        let id = undefined;
        const amount = this.safeNumber (transaction, 'amount');
        const timestamp = this.safeInteger (transaction, 'timestamp');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const state = this.safeString (transaction, 'state');
        if ('depositId' in transaction) {
            type = 'deposit';
            id = this.safeString (transaction, 'depositId');
        } else if ('withdrawalId' in transaction) {
            type = 'withdrawal';
            id = this.safeString (transaction, 'withdrawalId');
        }
        const feeCost = (type === 'withdrawal') ? this.safeNumber (transaction, 'fee') : undefined;
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        const address = this.safeString (transaction, 'address');
        const txid = this.safeString (transaction, 'txhash');
        const result = {
            'info': transaction,
            'id': id,
            'txid': txid,
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
            'status': this.parseTransactionState (state), // 'status':   'pending',   // 'ok', 'failed', 'canceled', string
            'updated': undefined,
            'comment': undefined,
            'fee': fee,
        };
        return result;
    }

    async fetchWithdrawalWhitelist (params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchWithdrawalWhitelist
         * @description fetch the list of withdrawal addresses on the whitelist
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} dictionary with keys beneficiaryId, name, currency
         */
        await this.loadMarkets ();
        const response = await this.privateGetWhitelist ();
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            result.push ({
                'beneficiaryId': this.safeString (entry, 'whitelistId'),
                'name': this.safeString (entry, 'name'),
                'currency': this.safeString (entry, 'currency'),
                'info': entry,
            });
        }
        return result;
    }

    async fetchWithdrawalWhitelistByCurrency (code: string, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetWhitelistCurrency (this.extend (request, params));
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            result.push ({
                'beneficiaryId': this.safeString (entry, 'whitelistId'),
                'name': this.safeString (entry, 'name'),
                'currency': this.safeString (entry, 'currency'),
                'info': entry,
            });
        }
        return result;
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'amount': amount,
            'currency': currency['id'],
            'beneficiary': address,
            'sendMax': false,
        };
        const response = await this.privatePostWithdrawals (this.extend (request, params));
        //
        //     {
        //         amount: "30.0",
        //         currency: "USDT",
        //         beneficiary: "adcd43fb-9ba6-41f7-8c0d-7013482cb88f",
        //         withdrawalId: "99df5ef7-eab6-4033-be49-312930fbd1ea",
        //         fee: "34.005078",
        //         state: "PENDING",
        //         timestamp: "1634218452595"
        //     },
        //
        return this.parseTransaction (response, currency);
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'from' : integer timestamp in ms
            // 'to' : integer timestamp in ms
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privateGetWithdrawals (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchWithdrawal (id: string, code: string = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchWithdrawal
         * @description fetch data on a currency withdrawal via the withdrawal id
         * @param {string} id withdrawal id
         * @param {string|undefined} code not used by blockchaincom.fetchWithdrawal
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            'withdrawalId': id,
        };
        const response = await this.privateGetWithdrawalsWithdrawalId (this.extend (request, params));
        return this.parseTransaction (response);
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'from' : integer timestamp in ms
            // 'to' : integer timestap in ms
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privateGetDeposits (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchDeposit (id: string, code: string = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchDeposit
         * @description fetch information on a deposit
         * @param {string} id deposit id
         * @param {string|undefined} code not used by blockchaincom fetchDeposit ()
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const depositId = this.safeString (params, 'depositId', id);
        const request = {
            'depositId': depositId,
        };
        const deposit = await this.privateGetDepositsDepositId (this.extend (request, params));
        return this.parseTransaction (deposit);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const accountName = this.safeString (params, 'account', 'primary');
        params = this.omit (params, 'account');
        const request = {
            'account': accountName,
        };
        const response = await this.privateGetAccounts (this.extend (request, params));
        //
        //     {
        //         "primary": [
        //             {
        //                 "currency":"ETH",
        //                 "balance":0.009,
        //                 "available":0.009,
        //                 "balance_local":30.82869,
        //                 "available_local":30.82869,
        //                 "rate":3425.41
        //             },
        //             ...
        //         ]
        //     }
        //
        const balances = this.safeValue (response, accountName);
        if (balances === undefined) {
            throw new ExchangeError (this.id + ' fetchBalance() could not find the "' + accountName + '" account');
        }
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const entry = balances[i];
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (entry, 'available');
            account['total'] = this.safeString (entry, 'balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by blockchaincom fetchOrder
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        // note: only works with exchange-order-id
        // does not work with clientOrderId
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetOrdersOrderId (this.extend (request, params));
        //
        //     {
        //         "exOrdId": 11111111,
        //         "clOrdId": "ABC",
        //         "ordType": "MARKET",
        //         "ordStatus": "FILLED",
        //         "side": "BUY",
        //         "price": 0.12345,
        //         "text": "string",
        //         "symbol": "BTC-USD",
        //         "lastShares": 0.5678,
        //         "lastPx": 3500.12,
        //         "leavesQty": 10,
        //         "cumQty": 0.123345,
        //         "avgPx": 345.33,
        //         "timestamp": 1592830770594
        //     }
        //
        return this.parseOrder (response);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const requestPath = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + requestPath;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            headers = {
                'X-API-Token': this.secret,
            };
            if ((method === 'GET')) {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        // {"timestamp":"2021-10-21T15:13:58.837+00:00","status":404,"error":"Not Found","message":"","path":"/orders/505050"
        if (response === undefined) {
            return undefined;
        }
        const text = this.safeString (response, 'text');
        if (text !== undefined) { // if trade currency account is empty returns 200 with rejected order
            if (text === 'Insufficient Balance') {
                throw new InsufficientFunds (this.id + ' ' + body);
            }
        }
        const errorCode = this.safeString (response, 'status');
        const errorMessage = this.safeString (response, 'error');
        if (code !== undefined) {
            const feedback = this.id + ' ' + this.json (response);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
        }
        return undefined;
    }
}
